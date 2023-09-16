import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'

export function App() {
  return (
    <BrowserRouter>
      <SWRConfig>
        <div id={'app'}></div>
      </SWRConfig>
    </BrowserRouter>
  )
}
