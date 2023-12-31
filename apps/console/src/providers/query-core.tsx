'use client'

import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { del, get, set } from 'idb-keyval'
import type {
  PersistedClient,
  Persister,
  PersistQueryClientOptions,
} from '@tanstack/react-query-persist-client'
import type { PropsWithChildren } from 'react'

import { TRPCClientError } from '@trpc/client'

declare module '@tanstack/query-core' {
  export interface QueryMeta {
    persist?: boolean
  }
}

const idbValidKey = 'reactQuery'
const persister = {
  persistClient: async (client: PersistedClient) => {
    set(idbValidKey, client)
  },
  restoreClient: async () => {
    return await get<PersistedClient>(idbValidKey)
  },
  removeClient: async () => {
    await del(idbValidKey)
  },
} as Persister

export const queryClient = new QueryClient({
  // queryCache: new QueryCache({
  //   onError(error, query) {
  //     console.log('error', error)
  //   },
  // }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: true,

      retry: (failureCount, error) => {
        if (error instanceof TRPCClientError) {
          if (error?.shape?.bizCode) {
            return false
          }
        }
        return failureCount < 3
      },
    },
  },
})

const persistOptions = {
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      const queryIsReadyForPersistance = query.state.status === 'success'

      if (query.meta?.persist === false) return false

      if (queryIsReadyForPersistance) {
        return !((query.state?.data as any)?.pages?.length > 1)
      } else {
        return false
      }
    },
  },
} as Omit<PersistQueryClientOptions, 'queryClient'>
export const ReactQueryProvider = ({ children }: PropsWithChildren) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
