import { NextUIProvider } from '@nextui-org/react'
import { Suspense } from 'react'
import { SWRConfig } from 'swr'

import { ColorModeObserver } from './components/common/ColorModeObserver'
import { InitialDataProvider } from './providers/initial'
import { Router } from './router'

export function App() {
  return (
    <SWRConfig>
      <Suspense>
        <NextUIProvider>
          <InitialDataProvider>
            <Router />
          </InitialDataProvider>
        </NextUIProvider>
        <ColorModeObserver />
      </Suspense>
    </SWRConfig>
  )
}
