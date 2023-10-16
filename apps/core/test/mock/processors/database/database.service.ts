import { extendedPrismaClient } from '@core/processors/database/prisma.instance'
import { Injectable } from '@nestjs/common'
import { prisma } from '@test/lib/prisma'

@Injectable()
export class MockedDatabaseService {
  private client: extendedPrismaClient
  constructor() {
    this.client = prisma
  }

  public get prisma() {
    return this.client
  }
}
