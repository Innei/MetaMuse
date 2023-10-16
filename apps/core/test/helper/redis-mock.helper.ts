import IORedis, { Redis } from 'ioredis'

import { RedisKeys } from '@core/constants/cache.constant'
import { CacheService } from '@core/processors/cache/cache.service'
import { getRedisKey } from '@core/shared/utils/redis.util'
import { Global, Module } from '@nestjs/common'

export class MockCacheService {
  private client: Redis
  constructor(port: number, host: string) {
    this.client = new IORedis(port, host)
  }

  private get redisClient() {
    return this.client
  }

  public get(key) {
    return this.client.get(key)
  }

  public set(key, value: any) {
    return this.client.set(key, value)
  }

  public getClient() {
    return this.redisClient
  }

  async cacheGet(options: {
    key: string | (Record<string, any> | string | undefined | number)[]
    getValueFun: () => Promise<any>
    /**
     * 过期时间，单位秒
     */
    expireTime?: number
  }) {
    const redis = this.getClient()
    const { key, getValueFun, expireTime } = options
    const cacheKey = getRedisKey(
      RedisKeys.CacheGet,
      Array.isArray(key) ? key.join('_') : key,
    )
    const cacheValue = await redis.get(cacheKey)
    if (!cacheValue) {
      return setValue()
    }

    try {
      return JSON.parse(cacheValue)
    } catch (err) {
      return setValue()
    }

    async function setValue() {
      const value = await getValueFun()
      await redis.set(cacheKey, JSON.stringify(value), 'EX', expireTime || 60)
      return value
    }
  }
}

const createMockRedis = async () => {
  let redisPort = 6379
  let redisHost = 'localhost'
  let redisServer: any
  if (process.env.CI) {
    // Skip
  } else {
    const RedisMemoryServer = require('redis-memory-server').default
    redisServer = new RedisMemoryServer({})

    redisHost = await redisServer.getHost()
    redisPort = await redisServer.getPort()
  }
  const cacheService = new MockCacheService(redisPort, redisHost)

  const provide = {
    provide: CacheService,
    useValue: cacheService,
  }
  @Module({
    providers: [provide],
    exports: [provide],
  })
  @Global()
  class CacheModule {}

  return {
    connect: () => null,
    CacheService: cacheService,
    token: CacheService,
    CacheModule,

    async close() {
      await cacheService.getClient().flushall()
      await cacheService.getClient().quit()
      if (!process.env.CI) {
        await redisServer?.stop()
      }
    },
  }
}

export const redisHelper = createMockRedis()
