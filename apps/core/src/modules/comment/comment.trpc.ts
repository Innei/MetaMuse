import { reduce } from 'lodash'
import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto, SnowflakeIdSchema } from '@core/shared/dto/id.dto'
import { PaginationResult } from '@core/shared/interface/paginator.interface'
import { Comment, CommentState } from '@meta-muse/prisma'
import { Record } from '@meta-muse/prisma/client/runtime/library'
import { Inject, Injectable } from '@nestjs/common'

import { ArticleService } from '../article/article.service'
import { CommentPagerSchema } from './comment.dto'
import { CommentService } from './comment.service'

@TRPCRouter()
@Injectable()
export class CommentTrpcRouter {
  private router: ReturnType<typeof this.createRouter>

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject(DatabaseService)
  private databaseService: DatabaseService

  @Inject(CommentService)
  private service: CommentService
  @Inject(ArticleService)
  private articleService: ArticleService

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter('comment', {
      unreadCount: procedureAuth.query(async () => {
        return this.databaseService.prisma.comment.count({
          where: {
            state: CommentState.UNREAD,
          },
        })
      }),
      list: procedureAuth.input(CommentPagerSchema).query(async (opt) => {
        const { input } = opt
        const {
          state,
          cursor,
          sortBy = 'created',
          sortOrder = 'desc',
          page = 1,
          size = 20,
        } = input
        const result = await this.databaseService.prisma.comment.paginate(
          {
            where: {
              state,
            },
            include: {
              parent: true,
            },
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              [sortBy]: sortOrder,
            },
          },
          {
            page,
            size,
          },
        )

        const mentionCommentIds = new Set<string>()

        for (const item of result.data) {
          if (!item?.mentions.length) continue

          for (const mentionCommentId of item.mentions) {
            if (mentionCommentIds.has(mentionCommentId)) continue

            mentionCommentIds.add(mentionCommentId)
          }
        }

        const mentionComments =
          await this.databaseService.prisma.comment.findMany({
            where: {
              id: {
                in: [...mentionCommentIds],
              },
            },
          })

        const dataWithPopulatedRef = await Promise.all(
          result.data.map(async (item) => {
            if (!item) return
            return {
              ...item,
              // NOTE optimize performance, to batch query
              ref: await this.articleService.findArticleByType(
                item.refType as any,
                item.refId,
              ),
            }
          }),
        )
        Object.assign(result, {
          data: dataWithPopulatedRef,
        })
        const nextResult = result as PaginationResult<
          (typeof result.data)[0] & {
            ref: NormalizedNoteModel | NormalizedPostModel
          }
        >
        nextResult.data = await this.service.fillAndReplaceAvatarUrl(
          nextResult.data,
        )
        return {
          ...nextResult,
          relations: {
            comments: reduce(
              mentionComments,
              (acc, cur) => {
                acc[cur.id] = cur
                return acc
              },
              {},
            ) as Record<string, Comment>,
          },
        }
      }),

      deleteComment: procedureAuth
        .input(SnowflakeIdDto.schema)
        .mutation(async ({ input }) => {
          const { id } = input

          return this.service.deleteComment(id)
        }),

      changeState: procedureAuth
        .input(
          z.object({
            state: z.nativeEnum(CommentState),
            id: SnowflakeIdSchema,
          }),
        )
        .mutation(async ({ input }) => {
          const { state, id } = input
          return this.service.changeState(id, state)
        }),
    })
  }
}
