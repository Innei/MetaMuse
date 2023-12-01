import fs, { WriteStream } from 'fs'
import { resolve } from 'path'
import { FastifyReply, FastifyRequest } from 'fastify'
import { chalk } from 'zx-cjs'

import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { HTTP_REQUEST_TIME } from '@core/constants/meta.constant'
import { LOG_DIR } from '@core/constants/path.constant'
import { REFLECTOR } from '@core/constants/system.constant'
import { logger } from '@core/global/consola.global'
import { isDev, isTest } from '@core/global/env.global'
import { errorMessageFor } from '@core/i18n/biz-code'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { getIp } from '../../shared/utils/ip.util'
import { BizException } from '../exceptions/biz.exception'
import { LoggingInterceptor } from '../interceptors/logging.interceptor'

type myError = {
  readonly status: number
  readonly statusCode?: number

  readonly message?: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)
  private errorLogPipe: WriteStream
  constructor(@Inject(REFLECTOR) private reflector: Reflector) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    if (request.method === 'OPTIONS') {
      return response.status(HttpStatus.OK).send()
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myError)?.status ||
          (exception as myError)?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      (exception as any)?.response?.message ||
      (exception as myError)?.message ||
      ''

    const url = request.raw.url!
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      Logger.error(exception, undefined, 'Catch')
      logger.error(exception)

      if (!isDev) {
        this.errorLogPipe =
          this.errorLogPipe ??
          fs.createWriteStream(resolve(LOG_DIR, 'error.log'), {
            flags: 'a+',
            encoding: 'utf-8',
          })

        this.errorLogPipe.write(
          `[${new Date().toISOString()}] ${decodeURI(url)}: ${
            (exception as any)?.response?.message ||
            (exception as myError)?.message
          }\n${(exception as Error).stack}\n`,
        )
      }
    } else {
      const ip = getIp(request)
      const logMessage = `IP: ${ip} Error Info: (${status}) ${message} Path: ${decodeURI(
        url,
      )}`
      if (isTest) console.log(logMessage)
      this.logger.warn(logMessage)
    }
    // @ts-ignore
    const prevRequestTs = this.reflector.get(HTTP_REQUEST_TIME, request as any)

    if (prevRequestTs) {
      const content = `${request.method} -> ${request.url}`
      Logger.debug(
        `--- ResponseError：${content}${chalk.yellow(
          ` +${+new Date() - prevRequestTs}ms`,
        )}`,
        LoggingInterceptor.name,
      )
    }
    const res = (exception as any).response

    let bizMessage = ''
    let bizCode = null as null | ErrorCodeEnum
    if (exception instanceof BizException) {
      const acceptLanguage = request.headers['accept-language'] || ''
      const languages = acceptLanguage.split(',')
      const preferredLanguage = languages[0]?.split(';')?.[0]

      bizMessage =
        errorMessageFor(exception.bizCode, preferredLanguage as any) ||
        exception.message
      bizCode = exception.bizCode
    }
    response
      .status(status)
      .type('application/json')
      .send({
        ok: 0,
        code: (bizCode ?? res?.code) || status,

        message:
          bizMessage ||
          (exception as any)?.response?.message ||
          (exception as any)?.message ||
          'Unknown Error',
      })
  }
}
