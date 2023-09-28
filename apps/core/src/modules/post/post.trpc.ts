import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { PostInputSchema } from './post.dto'
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
          return this.service.getPostById(opt.input.id)
        }),

      createTag: procedureAuth
        .input(
          z.object({
            name: z.string().max(20),
          }),
        )
        .mutation(async (opt) => {
          return this.databaseService.prisma.postTag.create({
            data: {
              name: opt.input.name,
            },
            select: {
              id: true,
            },
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
    })
  }
}
