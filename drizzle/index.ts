import { DrizzleConfig } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import postgres from 'postgres'

import * as schema from './schema'

export const createDrizzle = (
  url: string,
  options: Omit<DrizzleConfig, 'schema'>,
) => {
  const migrationClient = postgres(url, { max: 1 })

  return drizzle(migrationClient, {
    schema,
    ...options,
  })
}

export { schema }

export * from 'drizzle-orm'
