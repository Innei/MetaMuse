import { SWRConfig } from 'swr'

import { Router } from './router'

export function App() {
  return (
    <SWRConfig>
      <Router></Router>
    </SWRConfig>
  )
}
