import { NextUIProvider } from '@nextui-org/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Translation } from 'react-i18next'

import { ColorModeObserver } from './components/common/ColorModeObserver'
import { trpc, tRpcClient } from './lib/trpc'
import { InitialDataProvider } from './providers/initial'
import { queryClient } from './providers/query-core'
import { Router } from './router'
import { userStore } from './store/user'

userStore.loginByToken()
export function App() {
  return (
    <trpc.Provider client={tRpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Suspense>
          <NextUIProvider>
            <InitialDataProvider>
              <Translation>{() => <Router />}</Translation>
            </InitialDataProvider>
          </NextUIProvider>
          <ColorModeObserver />
        </Suspense>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
