import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { CacheService } from '@core/processors/cache/cache.service'
import { TRPCRouterBase } from '@core/processors/trpc/trpc.class'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRpc } from '@core/processors/trpc/trpc.instance'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Inject, Injectable } from '@nestjs/common'

import { ConfigsService } from './configs.service'

@TRPCRouter()
@Injectable()
export class ConfigsTRPCRouter extends TRPCRouterBase {
  @Inject()
  private readonly trpcService: tRPCService

  @Inject()
  private readonly service: ConfigsService

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

    return defineTrpcRouter('kv', {
      getPublic: tRpc.procedure
        .input(
          z.object({
            key: z.string(),
          }),
        )
        .query(async ({ input }) => {
          return this.service.getKV('public', input.key)
        }),
      get: t
        .input(
          z.object({
            scope: z.string(),
            key: z.string(),
          }),
        )
        .query(async ({ input }) => {
          return this.service.getKV(input.scope, input.key)
        }),

      setPublic: t
        .input(
          z.object({
            key: z.string(),
            value: z.any(),
          }),
        )
        .mutation(async ({ input }) => {
          const { key, value } = input
          return this.service.setKV('public', key, value)
        }),

      set: t
        .input(
          z.object({
            scope: z.string(),
            key: z.string(),
            value: z.any(),
            encrypt: z.boolean().optional(),
          }),
        )
        .mutation(async ({ input }) => {
          const { key, scope, value, encrypt = false } = input
          return this.service.setKV(scope, key, value, encrypt)
        }),
    })
  }
}
