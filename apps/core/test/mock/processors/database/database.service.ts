import { ExtendedPrismaClient } from '@core/processors/database/prisma.instance'
import { Injectable } from '@nestjs/common'
import { prisma } from '@test/lib/prisma'

@Injectable()
export class MockedDatabaseService {
  private client: ExtendedPrismaClient
  constructor() {
    this.client = prisma
  }

  public get prisma() {
    return this.client
  }
}
