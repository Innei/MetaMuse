import { Suspense } from 'react'
import { SWRConfig } from 'swr'

import { InitialDataProvider } from './providers/initial'
import { Router } from './router'

export function App() {
  return (
    <SWRConfig>
      <Suspense>
        <InitialDataProvider>
          <Router />
        </InitialDataProvider>
      </Suspense>
    </SWRConfig>
  )
}
