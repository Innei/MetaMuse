import { AxiosRequestConfig } from 'axios'
import { argv } from 'zx-cjs'

import { mergeArgv } from './shared/utils/env.util'
import { isDev } from './shared/utils/environment.util'

export const PORT = argv.port || 3333
export const DEMO_MODE = false
export const CROSS_DOMAIN = {
  allowedOrigins: [
    'innei.in',
    'shizuri.net',
    'localhost:9528',
    'localhost:2323',
    '127.0.0.1',
    'mbp.cc',
    'local.innei.test',
    '22333322.xyz',
  ],
  allowedReferer: 'innei.in',
}

export const DATABASE = {
  url: mergeArgv('database_url'),
}

export const REDIS = {
  host: argv.redis_host || 'localhost',
  port: argv.redis_port || 6379,
  password: argv.redis_password || null,
  ttl: null,
  httpCacheTTL: 5,
  max: 5,
  disableApiCache:
    (isDev || argv.disable_cache) && !process.env['ENABLE_CACHE_DEBUG'],
}
export const SECURITY = {
  jwtSecret: argv.jwtSecret || 'asjhczxiucipoiopiqm2376',
  jwtExpire: 7,
}

export const AXIOS_CONFIG: AxiosRequestConfig = {
  timeout: 10000,
}

export const ENCRYPT = {
  key: '',
  enable: false,
  algorithm: argv.encrypt_algorithm || 'aes-256-ecb',
}

export const CLUSTER = {
  enable: false,
  workers: argv.cluster_workers,
}
