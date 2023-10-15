import IORedis, { Redis, RedisOptions } from 'ioredis'

import { REDIS } from '@core/app.config.testing'
import { isTest } from '@core/global/env.global'
import { Injectable, Logger } from '@nestjs/common'

const logger = new Logger('SubscribeService')

@Injectable()
export class SubscribeService {
  static readonly shared = new SubscribeService()

  public pubClient: Redis
  public subClient: Redis

  constructor(private channelPrefix: string = 'meta-channel#') {
    if (!isTest) {
      this.init()
    }
  }

  public init() {
    const redisOptions: RedisOptions = {
      host: REDIS.host,
      port: REDIS.port,
    }

    if (REDIS.password) {
      redisOptions.password = REDIS.password
    }

    const pubClient = new IORedis(redisOptions)
    const subClient = pubClient.duplicate()
    this.pubClient = pubClient
    this.subClient = subClient
  }

  public async publish(event: string, data: any) {
    const channel = this.channelPrefix + event
    const _data = JSON.stringify(data)
    logger.debug(`发布事件：${channel} <- ${_data}`)
    await this.pubClient.publish(channel, _data)
  }

  private ctc = new WeakMap<Function, (channel: string, message: any) => any>()

  public async subscribe(event: string, callback: (data: any) => void) {
    const myChannel = this.channelPrefix + event
    this.subClient.subscribe(myChannel)

    const cb = (channel, message) => {
      if (channel === myChannel) {
        logger.debug(`接收事件：${channel} -> ${message}`)
        callback(JSON.parse(message))
      }
    }

    this.ctc.set(callback, cb)
    this.subClient.on('message', cb)
  }

  public async unsubscribe(event: string, callback: (data: any) => void) {
    const channel = this.channelPrefix + event
    this.subClient.unsubscribe(channel)
    const cb = this.ctc.get(callback)
    if (cb) {
      this.subClient.off('message', cb)

      this.ctc.delete(callback)
    }
  }
}
