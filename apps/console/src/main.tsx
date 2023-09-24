import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './App'

import './styles/index.css'

import { setStore } from 'jojoo'
import { getDefaultStore } from 'jotai/vanilla'

import { init18n } from './i18n'

init18n()

setStore(getDefaultStore())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
