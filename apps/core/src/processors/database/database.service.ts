import { inspect } from 'node:util'

import { DATABASE } from '@core/app.config'
import { createDrizzle } from '@meta-muse/drizzle'
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'

import {
  createExtendedPrismaClient,
  extendedPrismaClient,
} from './prisma.instance'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: extendedPrismaClient

  public drizzle: ReturnType<typeof createDrizzle>

  constructor() {
    this.client = createExtendedPrismaClient({
      url: DATABASE.url,
    })

    const drizzleLogger = new Logger('')
    this.drizzle = createDrizzle(DATABASE.url, {
      logger: {
        logQuery(query, params) {
          drizzleLogger.debug(query + inspect(params))
        },
      },
    })
  }

  async onModuleInit() {
    await this.client.$connect()
  }

  async onModuleDestroy() {
    await this.client.$disconnect()
  }

  public get prisma() {
    return this.client
  }
}
