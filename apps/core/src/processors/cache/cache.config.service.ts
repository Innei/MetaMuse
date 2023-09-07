/**
 * Cache config service.
 * @file Cache 配置器
 * @module processor/cache/config.service
 * @author Surmon <https://github.com/surmon-china>
 */
// import redisStore from 'cache-manager-redis-store'
import redisStore from 'cache-manager-ioredis'

import { REDIS } from '@core/app.config'
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  // 缓存配置
  public createCacheOptions(): CacheModuleOptions {
    const redisOptions: any = {
      host: REDIS.host as string,
      port: REDIS.port as number,
    }
    if (REDIS.password) {
      redisOptions.password = REDIS.password
    }
    return {
      store: redisStore,
      ttl: REDIS.ttl,
      // https://github.com/dabroek/node-cache-manager-redis-store/blob/master/CHANGELOG.md#breaking-changes
      // Any value (undefined | null) return true (cacheable) after redisStore v2.0.0
      is_cacheable_value: () => true,
      max: REDIS.max,
      ...redisOptions,
    }
  }
}
