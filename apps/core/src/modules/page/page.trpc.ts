import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto, SnowflakeIdSchema } from '@core/shared/dto/id.dto'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { PageInputSchema } from './page.dto'
import { PageService } from './page.service'

@TRPCRouter()
@Injectable()
export class PageTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject(DatabaseService)
  private databaseService: DatabaseService

  @Inject(PageService)
  private service: PageService

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter('page', {
      id: procedureAuth
        .input(
          z.object({
            id: z.string(),
          }),
        )
        .query(async (opt) => {
          return this.service.getPageById(opt.input.id).then((data) => {
            return {
              ...data,
            }
          })
        }),

      all: procedureAuth.query(async () => {
        const result = await this.databaseService.prisma.page.findMany()
        const resultWithSummary = result.map((item) => {
          if (!item?.text) return item
          return {
            ...item,
            text:
              item.text.length > 100
                ? `${item.text.slice(0, 100)}...`
                : item.text,
          }
        })
        return {
          ...result,
          data: resultWithSummary,
        }
      }),

      update: procedureAuth
        .input(
          PageInputSchema.extend({
            id: z.string(),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          const { id, ...data } = input

          await this.service.updateById(id, data)
        }),

      create: procedureAuth.input(PageInputSchema).mutation(async (opt) => {
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
