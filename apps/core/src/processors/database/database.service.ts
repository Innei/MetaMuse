import { DATABASE } from '@core/app.config'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import {
  createExtendedPrismaClient,
  ExtendedPrismaClient,
} from './prisma.instance'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: ExtendedPrismaClient
  constructor() {
    this.client = createExtendedPrismaClient({
      url: DATABASE.url,
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
