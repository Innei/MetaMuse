import { performance } from 'perf_hooks'
import { inspect } from 'util'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import chalk from 'chalk'

import { version } from '@core/../package.json'
import { AXIOS_CONFIG } from '@core/app.config'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { QueryClient } from '@tanstack/query-core'

declare module 'axios' {
  interface AxiosRequestConfig {
    __requestStartedAt?: number
    __requestEndedAt?: number
    __requestDuration?: number

    __debugLogger?: boolean
  }
}

@Injectable()
export class HttpService implements OnModuleInit {
  private http: AxiosInstance
  private logger: Logger

  onModuleInit() {
    this.logger = new Logger(HttpService.name)

    this.initQueryClient()
    this.http = this.bindInterceptors(
      axios.create({
        ...this.axiosDefaultConfig,
      }),
    )
  }

  private axiosDefaultConfig: AxiosRequestConfig<any> = {
    ...AXIOS_CONFIG,
    headers: {
      'user-agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36 MX-Space/${version}`,
    },
  }

  extend(config: AxiosRequestConfig<any>) {
    return this.bindDebugVerboseInterceptor(
      axios.create({ ...this.axiosDefaultConfig, ...config }),
    )
  }

  public get axiosRef() {
    return this.http
  }

  private _queryClient: QueryClient

  private initQueryClient() {
    this._queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 10,
        },
      },
    })
  }

  public get queryClient() {
    return this._queryClient
  }

  private bindDebugVerboseInterceptor($http: AxiosInstance) {
    $http.interceptors.request.use((req) => {
      if (!req.__debugLogger) {
        return req
      }
      req.__requestStartedAt = performance.now()

      this.logger.log(
        `HTTP Request: [${req.method?.toUpperCase()}] ${req.baseURL || ''}${
          req.url
        } 
params: ${this.prettyStringify(req.params)}
data: ${this.prettyStringify(req.data)}`,
      )

      return req
    })
    $http.interceptors.response.use(
      (res) => {
        if (!res.config.__debugLogger) {
          return res
        }
        const endAt = performance.now()
        res.config.__requestEndedAt = endAt
        res.config.__requestDuration =
          res.config?.__requestStartedAt ??
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          endAt - res.config!.__requestStartedAt!
        this.logger.log(
          `HTTP Response ${`${res.config.baseURL || ''}${
            res.config.url
          }`} +${res.config.__requestDuration.toFixed(
            2,
          )}ms: \n${this.prettyStringify(res.data)} `,
        )
        return res
      },
      (err) => {
        const res = err.response

        const error = Promise.reject(err)
        if (!res) {
          this.logger.error(
            `HTTP Response Failed ${err.config.url || ''}, Network Error: ${
              err.message
            }`,
          )
          return error
        }
        this.logger.error(
          chalk.red(
            `HTTP Response Failed ${`${res.config.baseURL || ''}${
              res.config.url
            }`}\n${this.prettyStringify(res.data)}`,
          ),
        )

        return error
      },
    )
    return $http
  }

  private bindInterceptors($http: AxiosInstance) {
    this.bindDebugVerboseInterceptor($http)
    return $http
  }

  private prettyStringify(data: any) {
    return inspect(data, { colors: true })
  }
}
