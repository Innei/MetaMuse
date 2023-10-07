import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto, SnowflakeIdSchema } from '@core/shared/dto/id.dto'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { PostInputSchema, PostPagerDto } from './post.dto'
import { PostService } from './post.service'

@TRPCRouter()
@Injectable()
export class PostTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject(DatabaseService)
  private databaseService: DatabaseService

  @Inject(PostService)
  private service: PostService

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter('post', {
      id: procedureAuth
        .input(
          z.object({
            id: z.string(),
          }),
        )
        .query(async (opt) => {
          return this.service.getPostById(opt.input.id).then((data) => {
            return {
              ...data,
              tagIds: data.tags.map((tag) => tag.id),
              relatedIds: data.related.map((post) => post.id),
            }
          })
        }),

      relatedList: procedureAuth
        .input(
          z.object({
            cursor: z.string().optional(),
            size: z.number().optional().default(10),
          }),
        )
        .query(async ({ input }) => {
          const { size: limit, cursor } = input
          const items = await this.databaseService.prisma.post.findMany({
            take: limit + 1,
            select: {
              id: true,
              title: true,
              created: true,
            },
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              created: 'desc',
            },
          })
          let nextCursor: typeof cursor | undefined = undefined
          if (items.length > limit) {
            const nextItem = items.pop()
            nextCursor = nextItem!.id
          }
          return {
            items,
            nextCursor,
          }
        }),

      paginate: procedureAuth.input(PostPagerDto.schema).query(
        async ({ input: query }) =>
          await this.service.paginatePosts({
            ...query,
            exclude: ['text', ...(query.exclude ?? [])],
          }),
      ),

      createTag: procedureAuth
        .input(
          z.object({
            name: z.string().max(20),
          }),
        )
        .mutation(async (opt) => {
          const { name } = opt.input
          return this.databaseService.prisma.$transaction(async (prisma) => {
            const tag = await prisma.postTag.findUnique({
              where: {
                name,
              },
            })
            if (tag) {
              return tag
            }

            return prisma.postTag.create({
              data: {
                name,
              },
              select: {
                id: true,
              },
            })
          })
        }),
      tags: procedureAuth.query(async () => {
        return (await this.databaseService.prisma.postTag.findMany()).map(
          (data) => {
            return {
              id: data.id,
              name: data.name,
            }
          },
        )
      }),

      update: procedureAuth
        .input(
          PostInputSchema.extend({
            id: z.string(),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          const { id, ...data } = input

          await this.service.updateById(id, data)
        }),

      create: procedureAuth.input(PostInputSchema).mutation(async (opt) => {
        const { input } = opt

        return await this.service.create(input)
      }),
      delete: procedureAuth
        .input(SnowflakeIdDto.schema)
        .mutation(async (opt) => {
          const { input } = opt

          await this.service.deleteById(input.id)
        }),

      batchDelete: procedureAuth
        .input(
          z.object({
            ids: z.array(SnowflakeIdSchema),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          await Promise.all(input.ids.map((id) => this.service.deleteById(id)))
        }),
    })
  }
}
