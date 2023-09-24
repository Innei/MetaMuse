import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { TRPCRouterBase } from '@core/processors/trpc/trpc.class'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Inject, Injectable } from '@nestjs/common'

import { ConfigsService } from '../configs/configs.service'
import { AggregateInfoQueryKeyDto } from './aggregate.dto'

@TRPCRouter()
@Injectable()
export class AggregateTrpcRouter extends TRPCRouterBase {
  protected router: ReturnType<typeof this.createRouter>

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject(ConfigsService)
  private configsService: ConfigsService
  onModuleInit() {
    this.router = this.createRouter()
  }

  createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter('aggregate', {
      queryConfigByKey: procedureAuth
        .input(AggregateInfoQueryKeyDto.schema)
        .query(async (opt) => {
          const {
            input: { key },
          } = opt
          return this.configsService.get(key)
        }),
    })
  }
}
