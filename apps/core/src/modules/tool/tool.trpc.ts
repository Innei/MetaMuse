import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { IpService } from '@core/processors/helper/services/helper.ip.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

@TRPCRouter()
@Injectable()
export class ToolTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject(DatabaseService) private databaseService: DatabaseService

  @Inject(IpService)
  private ipService: IpService

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter('tool', {
      ip: procedureAuth
        .input(
          z.object({
            ip: z.string().ip(),
          }),
        )
        .query(async ({ input }) => {
          const { ip } = input

          return this.ipService.fetchIpInfo(ip)
        }),
    })
  }
}
