import { ArticleType } from '@core/constants/article.constant'
import { RedisKeys } from '@core/constants/cache.constant'
import { getRedisKey } from '@core/shared/utils/redis.util'
import { Injectable, Logger } from '@nestjs/common'

import { CacheService } from '../../cache/cache.service'
import { DatabaseService } from '../../database/database.service'

@Injectable()
export class CountingService {
  private logger: Logger
  constructor(
    private readonly redis: CacheService,
    private readonly databaseService: DatabaseService,
  ) {
    this.logger = new Logger(CountingService.name)
  }

  private checkIdAndIp(id: string, ip: string) {
    if (!ip) {
      this.logger.debug('无法更新阅读计数，IP 无效')
      return false
    }
    if (!id) {
      this.logger.debug('无法更新阅读计数，ID 不存在')
      return false
    }
    return true
  }

  private async getDocById(type: ArticleType, id: string) {
    const [doc] = await this.databaseService.prisma.$queryRawUnsafe<
      {
        id: string
        title: string
        count: PrismaJson.ArticleCount
      }[]
    >(`SELECT id, title, count FROM "${type}" WHERE id = $1`, id)
    return doc
  }

  public async updateReadCount(type: ArticleType, id: string, ip: string) {
    if (!this.checkIdAndIp(id, ip)) {
      return
    }

    const doc = await this.getDocById(type, id)
    if (!doc) {
      this.logger.debug('无法更新阅读计数，文档不存在')
      return
    }

    const redis = this.redis.getClient()

    const isReadBefore = await redis.sismember(
      getRedisKey(RedisKeys.Read, id),
      ip,
    )
    if (isReadBefore) {
      this.logger.debug(`已经增加过计数了，${id}`)
      return
    }

    await this.databaseService.prisma.$executeRawUnsafe(
      `UPDATE "${type}"
SET count = jsonb_set(
    count,
    '{read}',
    to_jsonb((count->>'read')::int + 1)
)
WHERE id = $1`,
      id,
    )
    await redis.sadd(getRedisKey(RedisKeys.Read, doc.id), ip)
    this.logger.debug(`增加阅读计数，(${doc.title}`)
  }

  public async updateLikeCount(
    type: ArticleType,
    id: string,
    ip: string,
  ): Promise<boolean> {
    const redis = this.redis.getClient()
    const isLikeBefore = await this.getThisRecordIsLiked(id, ip)

    const doc = await this.getDocById(type, id)
    if (!doc) {
      throw '无法更新喜欢计数，文档不存在'
    }

    if (isLikeBefore) {
      this.logger.debug(`已经增加过计数了，${id}`)
      return false
    }
    await this.databaseService.prisma.$executeRawUnsafe(
      `UPDATE "${type}"
SET count = jsonb_set(
count,
'{like}',
to_jsonb((count->>'read')::int + 1)
)
WHERE id = $1;`,
      id,
    )
    await redis.sadd(getRedisKey(RedisKeys.Read, doc.id), ip)

    this.logger.debug(`增加喜欢计数，(${doc.title}`)
    return true
  }

  async getThisRecordIsLiked(id: string, ip: string) {
    if (!this.checkIdAndIp(id, ip)) {
      throw '无法获取到 IP'
    }

    const redis = this.redis.getClient()
    const isLikeBefore = await redis.sismember(
      getRedisKey(RedisKeys.Like, id),
      ip,
    )
    return !!isLikeBefore
  }
}
