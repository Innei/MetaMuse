import { inferRouterInputs, inferRouterOutputs, initTRPC } from '@trpc/server'

import { Context } from './trpc.context'
import { tRPCService } from './trpc.service'

export const tRpc = initTRPC.context<Context>().create()
export type tRpcRouterType = (typeof tRpc)['router']
export type tRpcProcedure = (typeof tRpc)['procedure']
export type tRpc$Config = typeof tRpc._config

export type AppRouter = tRPCService['appRouter']
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
