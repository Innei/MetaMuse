import cluster from 'cluster'
import { sign, verify } from 'jsonwebtoken'

import { CLUSTER, ENCRYPT, SECURITY } from '@core/app.config'
import { RedisKeys } from '@core/constants/cache.constant'
import { consola } from '@core/global/consola.global'
import { isDev } from '@core/global/env.global'
import { getRedisKey } from '@core/shared/utils/redis.util'
import { md5 } from '@core/shared/utils/tool.utils'
import { Injectable } from '@nestjs/common'

import { CacheService } from '../cache/cache.service'

@Injectable()
export class JWTService {
  private secret = ''

  constructor(private readonly cacheService: CacheService) {
    this.init()
  }

  init() {
    if (this.secret) {
      return
    }

    const ENCRYPT_KEY = ENCRYPT.key

    const secret =
      SECURITY.jwtSecret ||
      Buffer.from(ENCRYPT_KEY).toString('base64').slice(0, 15) ||
      'asjhczxiucipoiopiqm2376'

    if (isDev && cluster.isPrimary) {
      consola.debug(secret)
    }
    if (!CLUSTER.enable || cluster.isPrimary) {
      consola.debug(
        'JWT Secret start with :',
        secret.slice(0, 5) + '*'.repeat(secret.length - 5),
      )
    }
    this.secret = secret
  }

  async verify(token: string) {
    try {
      verify(token, this.secret)
      return await this.isTokenInRedis(token)
    } catch (er) {
      console.debug(er, token)

      return false
    }
  }

  async isTokenInRedis(token: string) {
    const redis = this.cacheService.getClient()
    const key = getRedisKey(RedisKeys.JWTStore)
    const has = await redis.hexists(key, md5(token))
    return !!has
  }

  async getAllSignSession(currentToken?: string) {
    const redis = this.cacheService.getClient()
    const res = await redis.hgetall(getRedisKey(RedisKeys.JWTStore))
    const hashedCurrent = currentToken && md5(currentToken)
    return Object.entries(res).map(([k, v]) => {
      return {
        ...JSON.parse(v),
        id: `jwt-${k}`,
        current: hashedCurrent === k,
      }
    })
  }

  async revokeToken(token: string, delay?: number) {
    const redis = this.cacheService.getClient()
    const key = getRedisKey(RedisKeys.JWTStore)
    if (delay) {
      // FIXME
      setTimeout(() => {
        redis.hdel(
          key,
          token.startsWith(`jwt-`) ? token.replace(`jwt-`, '') : md5(token),
        )
      }, delay)
    } else {
      await redis.hdel(
        key,
        token.startsWith(`jwt-`) ? token.replace(`jwt-`, '') : md5(token),
      )
    }
  }

  async revokeAll() {
    const redis = this.cacheService.getClient()
    const key = getRedisKey(RedisKeys.JWTStore)
    await redis.del(key)
  }

  async storeTokenInRedis(token: string, info?: any) {
    const redis = this.cacheService.getClient()
    await redis.hset(
      getRedisKey(RedisKeys.JWTStore),
      md5(token),
      JSON.stringify({
        date: new Date().toISOString(),
        ...info,
      } as StoreJWTPayload),
    )
  }

  public static readonly expiresDay = SECURITY.jwtExpire

  async sign(id: string, info?: { ip: string; ua: string }) {
    const token = sign({ id }, this.secret, {
      expiresIn: `${JWTService.expiresDay}d`,
    })
    await this.storeTokenInRedis(token, info || {})
    return token
  }
}

export interface StoreJWTPayload {
  /**
   * ISODateString
   */
  date: string
  [k: string]: any
}
