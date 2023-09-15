import { extendedPrismaClient } from '@core/processors/database/prisma.instance'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from '@test/lib/drizzle'
import { prisma } from '@test/lib/prisma'

@Injectable()
export class MockedDatabaseService {
  private client: extendedPrismaClient
  constructor(readonly configService: ConfigService) {
    this.client = prisma
  }

  public get prisma() {
    return this.client
  }

  public get drizzle() {
    return drizzle
  }
}
