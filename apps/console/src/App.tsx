import { NextUIProvider } from '@nextui-org/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Translation } from 'react-i18next'
import { Provider } from 'jotai'

import { ColorModeObserver } from './components/common/ColorModeObserver'
import { ToasterProvider } from './components/common/ToasterProvider'
import { FABContainer } from './components/ui/fab/FabContainer'
import { jotaiStore } from './lib/store'
import { trpc, tRpcClient } from './lib/trpc'
import { EventProvider } from './providers/event-provider'
import { InitialDataProvider } from './providers/initial'
import { queryClient } from './providers/query-core'
import { Router } from './router'
import { loginByToken, syncUser } from './store/user'

loginByToken()
syncUser()

const RouteComponent = () => <Router />

export function App() {
  return (
    <trpc.Provider client={tRpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Provider store={jotaiStore}>
          <Suspense>
            <EventProvider />

            <FABContainer />
            <NextUIProvider>
              <InitialDataProvider>
                <Translation>{RouteComponent}</Translation>
              </InitialDataProvider>
            </NextUIProvider>

            <ColorModeObserver />
            <ToasterProvider />
          </Suspense>
        </Provider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
