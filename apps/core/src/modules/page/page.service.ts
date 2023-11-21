import { omit } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { ImageService } from '@core/processors/helper/services/helper.image.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { scheduleManager } from '@core/shared/utils/schedule.util'
import { getLessThanNow } from '@core/shared/utils/time.util'
import { Page, Prisma } from '@meta-muse/prisma'
import { Inject, Injectable, Logger } from '@nestjs/common'

import { PageDto, PagePatchDto } from './page.dto'

const MAX_PAGE_COUNT = 10

@Injectable()
export class PageService {
  @Inject(DatabaseService)
  private readonly db: DatabaseService

  @Inject()
  private readonly eventManger: EventManagerService

  @Inject()
  private readonly imageService: ImageService

  private readonly logger = new Logger(PageService.name)

  async getAllPages() {
    return []
  }

  async getPageById(id: string) {
    return this.db.prisma.page
      .findUniqueOrThrow({
        where: {
          id,
        },
      })
      .catch(
        resourceNotFoundWrapper(new BizException(ErrorCodeEnum.PageNotFound)),
      )
  }

  async deleteById(id: string) {
    await this.db.prisma.page.delete({
      where: {
        id,
      },
    })

    await this.notifyPostUpdate(BusinessEvents.PAGE_DELETE, id)
  }

  async checkSlugIsAvailable(slug: string) {
    const result = await this.db.prisma.page.count({
      where: {
        slug,
      },
    })
    return result === 0
  }

  async create(data: PageDto) {
    const slug = data.slug
    const currentCount = await this.db.prisma.page.count()

    if (currentCount > MAX_PAGE_COUNT) {
      throw new BizException(ErrorCodeEnum.PageCountExceed)
    }

    const isAvailable = await this.checkSlugIsAvailable(slug)

    if (!isAvailable) {
      throw new BizException(ErrorCodeEnum.SlugExists)
    }
    const result = await this.db.prisma.page.create({
      // FUCK prisma
      data: this.dtoToPage(data, 'create') as any,
    })

    this.after(BusinessEvents.PAGE_CREATE, result)

    return result
  }

  async updateById(id: string, data: PagePatchDto) {
    const oldPage = await this.db.prisma.page.findUnique({
      where: { id },
    })
    if (!oldPage) {
      throw new BizException(ErrorCodeEnum.PageNotFound)
    }

    if (data.slug && oldPage.slug !== data.slug) {
      const isAvailable = this.checkSlugIsAvailable(data.slug)
      if (!isAvailable) throw new BizException(ErrorCodeEnum.SlugExists)
    }

    const result = await this.db.prisma.page.update({
      where: { id },
      data: this.dtoToPage(data, 'update'),
    })

    this.after(BusinessEvents.PAGE_UPDATE, result)
    return result
  }

  private dtoToPage(dto: PageDto, type: 'create'): Prisma.PageCreateInput
  private dtoToPage(dto: PagePatchDto, type: 'update'): Prisma.PageUpdateInput
  private dtoToPage(
    dto: PageDto | PagePatchDto,
    type: 'create' | 'update',
  ): Prisma.PageCreateInput | Prisma.PageUpdateInput {
    const input = {
      ...omit(
        dto,
        'related',
        'tagIds',
        'categoryId',
        'category',
        'tags',
        'modified',
        'relatedIds',
        'custom_created',
      ),
    } as Prisma.PageCreateInput | Prisma.PageUpdateInput

    if (dto.custom_created) {
      input.created = getLessThanNow(dto.custom_created)
    }

    return input
  }

  private after(
    event: BusinessEvents.PAGE_CREATE | BusinessEvents.PAGE_UPDATE,
    model: Page,
  ) {
    return scheduleManager.batch(() =>
      Promise.all([
        this.imageService
          .saveImageDimensionsFromMarkdownText(
            model.text,
            model.images,
            (newImages) => {
              return this.updateById(model.id, {
                images: newImages,
              })
            },
          )
          .catch((err) => {
            this.logger.warn(`Save image dimensions failed, ${err?.message}`)
          }),
        this.notifyPostUpdate(BusinessEvents.PAGE_CREATE, model.id),
      ]),
    )
  }

  private async notifyPostUpdate(
    type:
      | BusinessEvents.PAGE_CREATE
      | BusinessEvents.PAGE_UPDATE
      | BusinessEvents.PAGE_DELETE,
    id: string,
  ) {
    switch (type) {
      case BusinessEvents.PAGE_CREATE:
      case BusinessEvents.PAGE_UPDATE: {
        const result = await this.getPageById(id).catch(() => null)
        if (!result) return
        await this.eventManger.emit(type, result, {
          scope: EventScope.TO_SYSTEM_VISITOR,
        })

        break
      }

      case BusinessEvents.PAGE_DELETE:
        await this.eventManger.emit(type, { id }, { scope: EventScope.ALL })
        break
    }
  }
}
