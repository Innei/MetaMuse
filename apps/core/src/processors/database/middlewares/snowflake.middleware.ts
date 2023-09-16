import { Prisma } from '@meta-muse/prisma'

import { snowflake } from '../snowflake.util'

export const snowflakeGeneratorMiddleware: Prisma.Middleware = async (
  params,
  next,
) => {
  if (params.action === 'create') {
    const id = snowflake.nextId()

    params.args.data.id = id
  }

  if (params.action === 'createMany') {
    params.args.data.forEach((item) => {
      item.id = snowflake.nextId()
    })
  }
  return next(params)
}
