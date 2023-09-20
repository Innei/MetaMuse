import { NextUIProvider } from '@nextui-org/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

import { ColorModeObserver } from './components/common/ColorModeObserver'
import { InitialDataProvider } from './providers/initial'
import { queryClient } from './providers/query-core'
import { Router } from './router'
import { userStore } from './store/user'

userStore.loginByToken()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <NextUIProvider>
          <InitialDataProvider>
            <Router />
          </InitialDataProvider>
        </NextUIProvider>
        <ColorModeObserver />
      </Suspense>
    </QueryClientProvider>
  )
}
