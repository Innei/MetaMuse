import { Injectable } from '@nestjs/common'
import { DiscoveryService } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { initTRPC } from '@trpc/server'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'

import { createContext } from './trpc.context'

@Injectable()
export class tRPCService {
  constructor(private readonly discovery: DiscoveryService) {}

  // Singleton scope is used for injection by default so `t` is created only once
  t = initTRPC.create()

  appRouter = this.t.router({
    users: this.t.procedure.query(async (opts) => {
      // Here we can use providers injected by NestJS in our procedures
    }),
  })

  applyMiddleware(app: NestFastifyApplication) {
    app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: { router: this.appRouter, createContext },
    })
  }
}
