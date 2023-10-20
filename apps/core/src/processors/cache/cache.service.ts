import { Cache } from 'cache-manager'
import { Redis } from 'ioredis'

import { RedisIoAdapterKey } from '@core/common/adapter/io.adapter'
import { RedisKeys } from '@core/constants/cache.constant'
import { getRedisKey } from '@core/shared/utils/redis.util'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Emitter } from '@socket.io/redis-emitter'

// Cache 客户端管理器

// 获取器
export type TCacheKey = string
export type TCacheResult<T> = Promise<T | undefined>

/**
 * @class CacheService
 * @classdesc 承载缓存服务
 * @example CacheService.get(CacheKey).then()
 * @example CacheService.set(CacheKey).then()
 */
@Injectable()
export class CacheService {
  private cache!: Cache
  private logger = new Logger(CacheService.name)

  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    this.cache = cache
    this.redisClient.on('ready', () => {
      this.logger.log('Redis is ready!')
    })
  }

  private get redisClient(): Redis {
    // @ts-expect-error
    return this.cache.store.getClient()
  }

  public get<T>(key: TCacheKey): TCacheResult<T> {
    return this.cache.get(key)
  }

  public set(key: TCacheKey, value: any, ttl?: number | undefined) {
    return this.cache.set(key, value, ttl || 0)
  }

  public getClient() {
    return this.redisClient
  }

  private _emitter: Emitter

  public get emitter(): Emitter {
    if (this._emitter) {
      return this._emitter
    }
    this._emitter = new Emitter(this.redisClient, {
      key: RedisIoAdapterKey,
    })

    return this._emitter
  }

  async cacheGet<T>(options: {
    key: string | (Record<string, any> | string | undefined | number)[]
    getValueFun: () => Promise<T>
    /**
     * 过期时间，单位秒
     */
    expireTime?: number
  }): Promise<T> {
    const redis = this.getClient()
    const { key, getValueFun, expireTime } = options
    const cacheKey = getRedisKey(
      RedisKeys.CacheGet,
      Array.isArray(key) ? key.join('_') : key,
    )
    const cacheValue = await redis.get(cacheKey)
    console.log('cacheValue', cacheValue)
    if (!cacheValue) {
      return setValue()
    }

    try {
      return JSON.parse(cacheValue)
    } catch (err) {
      this.logger.error(err)
      return setValue()
    }

    async function setValue() {
      const value = await getValueFun()
      await redis.set(cacheKey, JSON.stringify(value), 'EX', expireTime || 60)
      return value
    }
  }
}
