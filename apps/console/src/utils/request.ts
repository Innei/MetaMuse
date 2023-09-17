import axios from 'axios'
import camelcaseKeys from 'camelcase-keys'

import { API_URL } from '~/constants/env'
import { router } from '~/router'

import { getToken } from './cookie'

const genUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {
    raw: T
  }
}

const $axios = axios.create({
  baseURL: API_URL,
  timeout: 5000,
})

$axios.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] = genUUID()

  config.params = config.params || {}
  config.params._t = Date.now()

  const token = getToken()
  if (token) {
    config.headers['Authorization'] = token
  }

  return config
})

$axios.interceptors.response.use(
  (response) => {
    response.raw = response.data
    response.data = camelcaseKeys(response.data, { deep: true })
    return response
  },
  (error) => {
    if (error?.response?.status === 401) {
      router.navigate(
        `/login?from=${encodeURIComponent(router.state.location.pathname)}`,
      )
    }
    return Promise.reject(error)
  },
)

export { $axios }
