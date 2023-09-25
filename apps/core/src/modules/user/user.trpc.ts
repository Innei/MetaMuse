import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Injectable, OnModuleInit } from '@nestjs/common'

@TRPCRouter()
@Injectable()
export class UserTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>
  constructor(private readonly trpcService: tRPCService) {}

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const t = this.trpcService.procedureAuth
    return defineTrpcRouter('user', {
      user: t.query(() => []),
    })
  }
}
