import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { CacheService } from '@core/processors/cache/cache.service'
import { TRPCRouterBase } from '@core/processors/trpc/trpc.class'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Inject, Injectable } from '@nestjs/common'

@TRPCRouter()
@Injectable()
export class ConfigsTRPCRouter extends TRPCRouterBase {
  @Inject()
  private readonly trpcService: tRPCService
  onModuleInit(): void {
    this.router = this.createRouter()
  }
  router: ReturnType<typeof this.createRouter>
  createRouter() {
    const t = this.trpcService.procedureAuth

    return defineTrpcRouter('configs', {
      kv: this.kv().kv,
    })
  }

  @Inject()
  private readonly cacheService: CacheService

  private kv() {
    const t = this.trpcService.procedureAuth

    const combinedKey = (scope: string, key: string) => `${scope}#${key}`

    return defineTrpcRouter('kv', {
      get: t
        .input(
          z.object({
            scope: z.string(),
            key: z.string(),
          }),
        )
        .query(async ({ input }) => {
          return this.cacheService.get<string>(
            combinedKey(input.scope, input.key),
          )
        }),

      set: t
        .input(
          z.object({
            scope: z.string(),
            key: z.string(),
            value: z.any(),
          }),
        )
        .mutation(async ({ input }) => {
          return this.cacheService.set(
            combinedKey(input.scope, input.key),
            JSON.stringify(input.value),
          )
        }),
    })
  }
}
