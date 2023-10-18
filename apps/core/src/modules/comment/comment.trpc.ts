import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { CommentState } from '@meta-muse/prisma'
import { Inject, Injectable } from '@nestjs/common'

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

        return this.service.paginate({
          ...input,
        })
      }),
    })
  }
}
