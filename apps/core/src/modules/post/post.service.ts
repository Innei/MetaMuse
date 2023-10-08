import { omit } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/helper.event.service'
import { ImageService } from '@core/processors/helper/helper.image.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { isDefined } from '@core/shared/utils/validator.util'
import { reorganizeData, toOrder } from '@core/utils/data.util'
import { deepEqual } from '@core/utils/tool.util'
import { Prisma } from '@meta-muse/prisma'
import { Injectable, Logger } from '@nestjs/common'

import { PostDto, PostPagerDto, PostPatchDto } from './post.dto'
import { PostIncluded } from './post.protect'

@Injectable()
export class PostService {
  private readonly logger: Logger
  constructor(
    private readonly db: DatabaseService,
    private readonly eventService: EventManagerService,
    private readonly imageService: ImageService,
  ) {
    this.logger = new Logger(PostService.name)
  }

  private dtoToPost(dto: PostDto, type: 'create'): Prisma.PostCreateInput
  private dtoToPost(dto: PostPatchDto, type: 'update'): Prisma.PostUpdateInput
  private dtoToPost(
    dto: PostDto | PostPatchDto,
    type: 'create' | 'update',
  ): Prisma.PostCreateInput | Prisma.PostUpdateInput {
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
    } as Prisma.PostCreateInput | Prisma.PostUpdateInput

    delete input.related
    delete input.category
    delete input.tags

    const setOrConnect = type === 'create' ? 'connect' : 'set'

    if (dto.summary === '') {
      input.summary = null
    }
    if (dto.custom_created) {
      input.created = dto.custom_created
    }
    if (dto.tagIds) {
      input.tags = {
        [setOrConnect]: dto.tagIds.map((id) => ({ id })),
      }
    }
    if (dto.categoryId) {
      input.category = {
        connect: {
          id: dto.categoryId,
        },
      }
    }

    input.related = {
      [setOrConnect]: dto.relatedIds?.map((id) => ({ id })) || [],
    }

    return input
  }

  async create(dto: PostDto) {
    const { slug, categoryId } = dto
    const exist = await this.db.prisma.post.findUnique({
      where: {
        slug_categoryId: {
          slug,
          categoryId,
        },
      },
      select: { id: true },
    })

    if (exist) {
      throw new BizException(ErrorCodeEnum.PostExist)
    }

    const model = await this.db.prisma.$transaction(async (prisma) => {
      const hasCategory = await this.db.prisma.category.exists({
        where: {
          id: categoryId,
        },
      })

      if (!hasCategory) {
        throw new BizException(ErrorCodeEnum.CategoryNotFound)
      }

      const newPost = await prisma.post.create({
        data: this.dtoToPost(dto, 'create'),
        include: PostIncluded,
      })

      return newPost
    })

    if (dto.relatedIds?.length) {
      await this.relateEachOther(model.id, dto.relatedIds)
    }

    if (model.pin) {
      await this.togglePin(model.id, true)
    }

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
      })

    await this.notifyPostUpdate(BusinessEvents.POST_CREATE, model.id)

    return model
  }

  private async notifyPostUpdate(
    type:
      | BusinessEvents.POST_CREATE
      | BusinessEvents.POST_UPDATE
      | BusinessEvents.POST_DELETE,
    id: string,
  ) {
    switch (type) {
      case BusinessEvents.POST_CREATE:
      case BusinessEvents.POST_UPDATE: {
        const result = await this.getPostById(id).catch(() => null)
        if (!result) return
        if (result.isPublished)
          await this.eventService.emit(type, result, {
            scope: EventScope.TO_VISITOR,
          })
        await this.eventService.emit(type, result, {
          scope: EventScope.TO_SYSTEM,
        })
        break
      }

      case BusinessEvents.POST_DELETE:
        await this.eventService.emit(type, { id }, { scope: EventScope.ALL })
        break
    }
  }

  private async relateEachOther(
    postId: string,

    relatedIds: string[],
    oldRelatedIds?: string[],
  ) {
    return this.db.prisma.$transaction(async (prisma) => {
      if (oldRelatedIds?.length) {
        await Promise.all(
          oldRelatedIds.map((relatedId) =>
            prisma.post.update({
              where: {
                id: relatedId,
              },
              data: {
                related: {
                  disconnect: {
                    id: postId,
                  },
                },
              },
            }),
          ),
        )
      }
      await Promise.all(
        relatedIds.map((relatedId) =>
          prisma.post.update({
            where: {
              id: relatedId,
            },
            data: {
              related: {
                connect: {
                  id: postId,
                },
              },
            },
          }),
        ),
      )
    })
  }

  private togglePin(id: string, pin: boolean) {
    if (!pin) {
      return this.db.prisma.post.update({
        where: {
          id,
        },
        data: {
          pin: false,
        },
      })
    }
    return this.db.prisma.$transaction([
      this.db.prisma.post.update({
        where: {
          id,
        },
        data: {
          pin: true,
        },
      }),

      this.db.prisma.post.updateMany({
        where: {
          NOT: { id },
        },
        data: { pin: false },
      }),
    ])
  }

  async paginatePosts(
    options: PostPagerDto,
    filter: Prisma.PostWhereInput = {},
  ) {
    const {
      select,
      exclude,
      size = 10,
      page = 1,
      sortBy = 'created',
      sortOrder = -1,
    } = options

    const data = await this.db.prisma.post.paginate(
      {
        include: PostIncluded,
        where: filter,

        orderBy: [
          {
            pin: 'desc',
          },
          {
            [sortBy]: toOrder(sortOrder),
          },
        ],
      },
      {
        size,
        page,
      },
    )

    data.data = reorganizeData(data.data, select, exclude)

    return data
  }

  async getLastPost() {
    return this.db.prisma.post.findFirst({
      orderBy: {
        created: 'desc',
      },
      include: PostIncluded,
    })
  }

  async getPostById(id: string) {
    return this.db.prisma.post
      .findUniqueOrThrow({
        where: {
          id,
        },
        include: PostIncluded,
      })
      .catch(
        resourceNotFoundWrapper(new BizException(ErrorCodeEnum.PostNotFound)),
      )
  }

  async getCategoryBySlug(slug: string) {
    return this.db.prisma.category.findUnique({ where: { slug } })
  }

  async getPostBySlug(slug: string, categorySlug: string) {
    const category = await this.getCategoryBySlug(categorySlug)
    if (!category) {
      throw new BizException(ErrorCodeEnum.CategoryNotFound)
    }

    return this.db.prisma.post.findUnique({
      where: {
        slug_categoryId: {
          slug,
          categoryId: category.id,
        },
      },
      include: PostIncluded,
    })
  }

  async updateById(id: string, data: PostPatchDto) {
    const [originPost] = await this.db.prisma.$transaction(async (prisma) => {
      const originPost = await prisma.post.findUnique({
        where: { id },
        select: {
          categoryId: true,
          modified: true,
          images: true,
          related: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!originPost) {
        throw new BizException(ErrorCodeEnum.PostNotFound)
      }

      const { categoryId } = data

      if (categoryId && categoryId !== originPost.categoryId) {
        await prisma.category
          .findUniqueOrThrow({
            where: {
              id: categoryId,
            },
          })
          .catch(
            resourceNotFoundWrapper(
              new BizException(ErrorCodeEnum.CategoryNotFound),
            ),
          )
      }

      const updatedData = this.dtoToPost(data, 'update')

      if ([data.text, data.title, data.slug].some((i) => isDefined(i))) {
        const now = new Date()

        updatedData.modified = now
      }

      await prisma.post.update({
        where: {
          id,
        },
        data: updatedData,
      })

      return [originPost, updatedData]
    })

    // 有关联文章
    const related = data.relatedIds?.filter((i) => i !== id) || []

    if (data.text)
      this.imageService
        .saveImageDimensionsFromMarkdownText(
          data.text,
          originPost.images,
          async (newImages) => {
            if (deepEqual(newImages, originPost.images)) return
            return this.updateById(id, {
              images: newImages,
            })
          },
        )
        .catch((err) => {
          this.logger.warn(`Save image dimensions failed, ${err?.message}`)
        })

    await this.relateEachOther(
      id,
      related,
      originPost.related.map((i) => i.id),
    )

    this.notifyPostUpdate(BusinessEvents.POST_UPDATE, id)
  }

  async deleteById(id: string) {
    const post = await this.getPostById(id)

    await this.db.prisma.$transaction(async (prisma) => {
      const exist = await prisma.post.exists({
        where: { id },
      })
      if (!exist) throw new BizException(ErrorCodeEnum.PostNotFound)
      await prisma.post.delete({
        where: {
          id,
        },
      })
    })

    await this.notifyPostUpdate(BusinessEvents.POST_DELETE, id)

    return post
  }
}
