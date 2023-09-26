import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './App'

import './styles/index.css'

import { init18n } from './i18n'

init18n()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
