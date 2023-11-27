import { Logger } from 'nestjs-pretty-logger'
import wcmatch from 'wildcard-match'
import { chalk } from 'zx-cjs'

import { NestFactory } from '@nestjs/core'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

import { CROSS_DOMAIN, PORT } from './app.config'
import { AppModule } from './app.module'
import { fastifyApp } from './common/adapter/fastify.adapter'
import { SpiderGuard } from './common/guards/spider.guard'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { logger } from './global/consola.global'
import { tRPCService } from './processors/trpc/trpc.service'
import { isDev } from './shared/utils/environment.util'

// const APIVersion = 1
const Origin = CROSS_DOMAIN.allowedOrigins

declare const module: any

Logger.setLoggerInstance(logger)

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyApp,
    { logger: ['error', 'debug'] },
  )

  app.enableCors(
    isDev
      ? undefined
      : Origin
        ? {
            origin: (origin, callback) => {
              let currentHost: string
              try {
                currentHost = new URL(origin).host
              } catch {
                currentHost = origin
              }
              const allow = Origin.some((host) => wcmatch(host)(currentHost))

              callback(null, allow)
            },
            credentials: true,
          }
        : undefined,
  )

  isDev && app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalGuards(new SpiderGuard())

  const trpcService = app.get(tRPCService)
  trpcService.applyMiddleware(app)

  await app.listen(+PORT, '0.0.0.0', async () => {
    app.useLogger(app.get(Logger))
    logger.info('ENV:', process.env.NODE_ENV)
    const url = await app.getUrl()
    const pid = process.pid

    const prefix = 'P'

    logger.success(`[${prefix + pid}] Server listen on: ${url}`)

    logger.info(`Server is up. ${chalk.yellow(`+${performance.now() | 0}ms`)}`)
  })
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
