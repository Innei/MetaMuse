import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/helper.event.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { Injectable } from '@nestjs/common'

import { PostDto, PostPagerDto } from './post.dto'

@Injectable()
export class PostService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventService: EventManagerService,
  ) {}

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
        data: {
          ...dto,
          related: { connect: dto.related?.map((id) => ({ id })) } || [],
        },
        include: {
          category: true,
        },
      })

      if (dto.related?.length) {
        await Promise.all(
          dto.related.map((id) =>
            prisma.post.update({
              where: {
                id,
              },
              data: {
                related: {
                  connect: {
                    id: newPost.id,
                  },
                },
              },
            }),
          ),
        )
      }

      return newPost
    })

    if (model.pin) {
      await this.togglePin(model.id, true)
    }

    this.eventService.event(BusinessEvents.POST_CREATE, model)

    return model
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

  async paginatePosts(options: PostPagerDto) {
    const { size, page, sortBy = 'created', sortOrder } = options
    return this.db.prisma.post.paginate(
      {
        include: {
          category: true,
          related: {
            select: {
              id: true,
              title: true,
              category: true,
              slug: true,
              created: true,
            },
          },
        },
        orderBy: [
          {
            [sortBy]: sortOrder,
          },
          {
            pin: 'desc',
          },
        ],
      },
      {
        size,
        page,
      },
    )
  }

  async getPostById(id: string) {
    return this.db.prisma.post
      .findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          category: true,
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              created: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      })
      .catch(
        resourceNotFoundWrapper(new BizException(ErrorCodeEnum.PostNotFound)),
      )
  }
}
