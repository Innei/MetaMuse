import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/helper.event.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { isDefined } from '@core/shared/utils/validator.util'
import { Injectable } from '@nestjs/common'
import { Post, Prisma } from '@prisma/client'

import { PostDto, PostPagerDto, PostPatchDto } from './post.dto'
import { PostIncluded } from './post.protect'

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

      return newPost
    })

    if (dto.related?.length) {
      await this.relateEachOther(model.id, dto.related)
    }

    if (model.pin) {
      await this.togglePin(model.id, true)
    }

    this.eventService.event(BusinessEvents.POST_CREATE, model)

    return model
  }

  private async relateEachOther(postId: string, relatedIds: string[]) {
    // await this.db.prisma.$transaction(async (prisma) => {
    //   await Promise.all(
    //     relatedIds.map((id) =>
    //       prisma.post.update({
    //         where: {
    //           id,
    //         },
    //         data: {
    //           related: {
    //             connect: {
    //               id: postId,
    //             },
    //           },
    //         },
    //       }),
    //     ),
    //   )
    // })

    this.db.prisma.$transaction(async (prisma) => {
      await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          related: {
            set: [],
          },
        },
      })
      await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          related: {
            connect: [
              ...relatedIds.filter((i) => i !== postId).map((i) => ({ id: i })),
            ],
          },
        },
      })
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
      size = 10,
      page = 1,
      sortBy = 'created',
      sortOrder = -1,
    } = options
    const nextSortOrder = {
      ['-1']: 'desc',
      [1]: 'asc',
    }[sortOrder.toString()]

    const data = await this.db.prisma.post.paginate(
      {
        include: PostIncluded,
        where: filter,

        orderBy: [
          {
            pin: 'desc',
          },
          {
            [sortBy]: nextSortOrder,
          },
        ],
      },
      {
        size,
        page,
      },
    )

    if (select?.length) {
      const nextData = [] as typeof data.data
      for (const item of data.data) {
        if (!item) continue
        const currentItem = {} as any
        for (const key of select) {
          currentItem[key] = item[key]
        }
        nextData.push(currentItem)
      }

      data.data = nextData
    }

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
    await this.db.prisma.$transaction(async (prisma) => {
      const originPost = await prisma.post.findUnique({
        where: { id },
        select: {
          categoryId: true,
          modified: true,
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

      const updatedData: Partial<Post> = {
        ...data,
      }

      // @ts-expect-error
      delete updatedData.related

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
    })

    // 有关联文章
    const related = data.related?.filter((i) => i !== id) || []
    if (related.length) {
      await this.relateEachOther(id, related)
    }
  }
}
