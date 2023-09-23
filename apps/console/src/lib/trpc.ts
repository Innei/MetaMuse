import {
  createTRPCReact,
  httpBatchLink,
  inferReactQueryProcedureOptions,
} from '@trpc/react-query'

import {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '@core/processors/trpc/trpc.instance'

import { API_URL } from '~/constants/env'

import { getToken } from './cookie'

export const trpc = createTRPCReact<AppRouter>()

export const tRpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      // You can pass any HTTP headers you wish here
      async headers() {
        return {
          authorization: getToken()!,
        }
      },
    }),
  ],
})

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>

export type { RouterInputs, RouterOutputs }
