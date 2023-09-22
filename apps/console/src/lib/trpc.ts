import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query'

import { AppRouter } from '@core/processors/trpc/trpc.service'

import { API_URL } from '~/constants/env'

import { getToken } from './cookie'

export const trpc = createTRPCReact<AppRouter>()

export const tRpcClient = createTRPCProxyClient<AppRouter>({
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
