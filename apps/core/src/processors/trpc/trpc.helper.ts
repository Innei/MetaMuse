import { tRpc, tRpcRouterType } from './trpc.instance'

type ObjWithKey<T extends string, Value> = { [K in T]: Value }

export const defineRouter = <
  T extends string,
  P extends Parameters<tRpcRouterType>[0],
>(
  route: T,
  routes: P,
) => {
  const rpcRoute = tRpc.router(routes)
  return tRpc.router({
    [route]: rpcRoute,
  } as any as ObjWithKey<T, typeof rpcRoute>)
}
