import { Suspense } from 'react'
import { SWRConfig } from 'swr'

import { ColorModeObserver } from './components/common/ColorModeObserver'
import { InitialDataProvider } from './providers/initial'
import { Router } from './router'

export function App() {
  return (
    <SWRConfig>
      <Suspense>
        <InitialDataProvider>
          <Router />
        </InitialDataProvider>
        <ColorModeObserver />
      </Suspense>
    </SWRConfig>
  )
}
