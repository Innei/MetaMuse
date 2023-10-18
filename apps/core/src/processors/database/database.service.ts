import { DATABASE } from '@core/app.config'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

import {
  createExtendedPrismaClient,
  ExtendedPrismaClient,
} from './prisma.instance'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: ExtendedPrismaClient

  static readonly client = createExtendedPrismaClient({
    url: DATABASE.url,
  })
  constructor() {
    this.client = DatabaseService.client
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

export const sql = DatabaseService.client.$queryRaw.bind(DatabaseService.client)
