import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { TRPCRouterBase } from '@core/processors/trpc/trpc.class'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRpc } from '@core/processors/trpc/trpc.instance'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Inject, Injectable } from '@nestjs/common'

import { HelpersService } from './helpers.service'

@Injectable()
@TRPCRouter()
export class HelpersTrpcRouter extends TRPCRouterBase {
  @Inject()
  private readonly service: HelpersService
  @Inject()
  private readonly trpcService: tRPCService

  createRouter() {
    const tAuth = this.trpcService.procedureAuth
    const t = tRpc.procedure
    return defineTrpcRouter('helpers', {
      urlBuilder: t.input(SnowflakeIdDto.schema).query(async (opt) => {
        const { input } = opt

        return this.service.buildUrlById(input.id)
      }),
    })
  }

  onModuleInit(): void {
    this.router = this.createRouter()
  }
}
