import { OnModuleInit } from '@nestjs/common'
import { CreateRouterInner } from '@trpc/server'

interface TRPCWithRouter {
  createRouter(): CreateRouterInner<any, any>
}

export abstract class TRPCRouterBase implements OnModuleInit, TRPCWithRouter {
  protected abstract router: ReturnType<typeof this.createRouter>

  abstract createRouter(): CreateRouterInner<any, any>

  onModuleInit() {
    this.router = this.createRouter()
  }
}
