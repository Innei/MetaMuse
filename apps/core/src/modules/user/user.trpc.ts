import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Injectable } from '@nestjs/common'

@TRPCRouter()
@Injectable()
export class UserTrpcRouter {
  private router: ReturnType<typeof this.createRouter>
  constructor(private readonly trpcService: tRPCService) {
    this.router = this.createRouter()
  }

  private createRouter() {
    const t = this.trpcService.t
    return t.router({
      user: t.router({}),
    })
  }
}
