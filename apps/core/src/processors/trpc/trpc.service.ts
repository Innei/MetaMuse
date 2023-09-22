import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { DiscoveryService, Reflector } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { initTRPC } from '@trpc/server'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'

import { createContext } from './trpc.context'
import { tRpcRouters } from './trpc.routes'

const t = initTRPC.create()

interface TA {
  router: any
}

type ExtractRouterType<T extends TA> = T['router']

type MapToRouterType<T extends any[]> = {
  [K in keyof T]: ExtractRouterType<T[K]>
}

type Routers = MapToRouterType<tRpcRouters>

@Injectable()
export class tRPCService implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
  ) {
    this.logger = new Logger('tRPCService')
  }

  public get t() {
    return t
  }

  onModuleInit() {
    this.createAppRouter()
  }

  private logger: Logger
  appRouter: ReturnType<typeof this.createAppRouter>

  private createAppRouter() {
    const p = this.discovery.getProviders()
    const routers = p
      .filter((provider) => {
        try {
          return this.reflector.get('TRPC_ROUTER', provider.metatype)
        } catch {
          return false
        }
      })
      .map(({ instance }) => instance.router)
      .filter((router) => {
        if (!router) {
          this.logger.warn('missing router.')
        }

        return !!router
      })

    const appRouter = t.mergeRouters(...(routers as any as Routers))
    this.appRouter = appRouter
    return appRouter
  }

  applyMiddleware(_app: NestFastifyApplication) {
    _app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: this.appRouter,
        createContext,
      },
    })
  }
}

export type AppRouter = tRPCService['appRouter']
