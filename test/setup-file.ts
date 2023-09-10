import { redisHelper } from './helper/redis-mock.helper'
import { prisma } from './lib/prisma'
import resetDb from './lib/reset-db'

beforeAll(async () => {
  await resetDb()
})

afterAll(async () => {
  await resetDb()
  await prisma.$disconnect()
  await (await redisHelper).close()
})
