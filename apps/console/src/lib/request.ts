import axios, { AxiosError } from 'axios'
import camelcaseKeys from 'camelcase-keys'
import { toast } from 'sonner'

import { ErrorCodeEnum } from '@core/constants/error-code.constant'

import { API_URL } from '~/constants/env'
import { router } from '~/router'

import { BizError } from './biz-error'
import { getToken, removeToken } from './cookie'

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

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** if true, will not throw BizError
     * @default false
     */
    ignoreBizError?: boolean
  }
}

$axios.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] = genUUID()

  config.params = config.params || {}
  config.params._t = Date.now()

  config.ignoreBizError = config.ignoreBizError || false

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
    Object.defineProperty(response.data, '$$raw', response)
    return response.data
  },
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(error)
    }
    const res = error.response

    if (res?.status === 401) {
      removeToken()
      router.navigate(
        `/login?from=${encodeURIComponent(router.state.location.pathname)}`,
      )
    }

    const data: any = res.data || {}
    if (typeof data.code === 'number') {
      if (data.code === ErrorCodeEnum.NotInitialized) {
        router.navigate('/setup')
      }

      if (!error.config?.ignoreBizError) {
        toast.error(data.chMessage || data.message)
      }
      return Promise.reject(
        new BizError(
          data.code,
          data.message,
          data.chMessage,
          res.status,
          error,
        ),
      )
    }

    return Promise.reject(error)
  },
)

export { $axios }
