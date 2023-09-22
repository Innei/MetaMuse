import { tRPCService } from '@core/processors/trpc/trpc.service'
import { Injectable } from '@nestjs/common'

const TRPC_ROUTER = 'TRPC_ROUTER'
const TRPCRouter = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(TRPC_ROUTER, true, target)
  }
}

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
      user: t.router({
        query: t.procedure.query(() => {
          return []
        }),
      }),
    })
  }
}
