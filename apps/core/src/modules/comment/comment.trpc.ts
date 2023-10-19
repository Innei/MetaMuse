import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { PaginationResult } from '@core/shared/interface/paginator.interface'
import { CommentState } from '@meta-muse/prisma'
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
          sortOrder,
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

        const dataWithPopulatedRef = await Promise.all(
          result.data.map(async (item) => {
            if (!item) return
            return {
              ...item,
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
            ref: any
          }
        >
        return nextResult
      }),
    })
  }
}
