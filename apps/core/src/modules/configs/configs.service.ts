import { RedisKeys } from '@core/constants/cache.constant'
import { CacheService } from '@core/processors/cache/cache.service'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { EncryptUtil } from '@core/shared/utils/encrypt.util'
import { getRedisKey } from '@core/shared/utils/redis.util'
import { sleep } from '@core/shared/utils/tool.utils'
import { Injectable, Logger } from '@nestjs/common'

import { UserService } from '../user/user.service'
import { generateDefaultConfig } from './configs.default'
import { IConfig } from './configs.interface'

@Injectable()
export class ConfigsService {
  private logger: Logger
  constructor(
    private readonly userService: UserService,
    private readonly redis: CacheService,
    private readonly db: DatabaseService,

    private readonly eventManager: EventManagerService,
  ) {
    this.configInit().then(() => {
      this.logger.log('Config loaded!')
    })

    this.logger = new Logger(ConfigsService.name)
  }

  private configInitd = false
  public async waitForConfigReady() {
    if (this.configInitd) {
      return await this.getConfig()
    }

    const maxCount = 10
    let curCount = 0
    do {
      if (this.configInitd) {
        return await this.getConfig()
      }
      await sleep(100)
      curCount += 1
    } while (curCount < maxCount)

    throw `重试 ${curCount} 次获取配置失败, 请检查数据库连接`
  }

  // Config 在此收口
  public async getConfig(errorRetryCount = 3): Promise<Readonly<IConfig>> {
    const redis = this.redis.getClient()
    const configCache = await redis.get(getRedisKey(RedisKeys.ConfigCache))

    return this.defaultConfig

    if (configCache) {
      // TODO
    } else {
      await this.configInit()

      return await this.getConfig()
    }
  }

  protected async configInit() {
    // TODO
    this.configInitd = true
  }

  public defaultConfig = generateDefaultConfig()

  public get<T extends keyof IConfig>(key: T): Promise<Readonly<IConfig[T]>> {
    return Promise.resolve(this.defaultConfig[key])
  }

  /// get kv

  async getKV(scope: string, key: string) {
    const nextKey = combinedKey(scope, key)

    const value = await this.redis.get<string>(nextKey)
    if (value) {
      return EncryptUtil.decrypt(value)
    }
    const dbValue = await this.db.prisma.configKV.findFirst({
      where: {
        scope,
        key,
      },
    })

    if (dbValue) {
      await this.redis.set(nextKey, dbValue.value)
      return EncryptUtil.decrypt(dbValue.value)
    }
  }

  /// set kv
  //
  async setKV(scope: string, key: string, value: any, encrypt = false) {
    const nextKey = combinedKey(scope, key)

    value = JSON.stringify(value)
    if (encrypt) {
      value = EncryptUtil.encrypt(value)
    }
    await this.redis.set(nextKey, value)

    await this.db.prisma.configKV.upsert({
      where: {
        key_scope: {
          key,
          scope,
        },
      },
      create: {
        scope,
        key,
        value,
      },
      update: {
        value,
      },
    })
  }
}

const combinedKey = (scope: string, key: string) => `${scope}#${key}`
