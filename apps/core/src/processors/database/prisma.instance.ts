import { isDev } from '@core/global/env.global'
import { PaginationResult } from '@core/shared/interface/paginator.interface'
import { Logger } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

import { snowflakeGeneratorMiddleware } from './middlewares/snowflake.middleware'

const logger = new Logger('PrismaClient')
export const createExtendedPrismaClient = ({ url }: { url?: string } = {}) => {
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  })
  prismaClient.$use(snowflakeGeneratorMiddleware)

  if (isDev) {
    prismaClient.$on('query', async (e) => {
      logger.debug(`Query: ${e.query}`)

      logger.debug(`Duration: ${e.duration}ms`)
    })
  }
  const extendedPrismaClient = prismaClient.$extends({
    result: {
      // post: {
      //   relatedIds: {
      //     compute(post) {
      //       return post.related.map((x) => x.id)
      //     },
      //   },
      // },
    },
    model: {
      $allModels: {
        async paginate<T, A>(
          this: T,
          x: Prisma.Exact<
            A,
            Pick<
              Prisma.Args<T, 'findFirst'>,
              'where' | 'select' | 'include' | 'orderBy'
            >
          >,
          options: {
            page: number
            size: number
          },
        ): Promise<PaginationResult<Prisma.Result<T, A, 'findFirst'>>> {
          if (typeof x !== 'object') {
            return {
              data: [],
              pagination: {
                total: 0,
                size: 0,
                totalPage: 0,
                currentPage: 0,

                hasNextPage: false,
                hasPrevPage: false,
              },
            }
          }

          const { page, size: perPage } = options
          const skip = page > 0 ? perPage * (page - 1) : 0
          const countArgs = 'select' in x ? { where: x.where } : {}
          const [total, data] = await Promise.all([
            (this as any).count(countArgs),
            (this as any).findMany({
              ...x,
              take: perPage,
              skip,

              // @ts-ignore
              orderBy: x.orderBy,
              // @ts-ignore
              include: x.include,
            }),
          ])

          const lastPage = Math.ceil(total / perPage)

          return {
            data,
            pagination: {
              total,
              size: perPage,
              totalPage: lastPage,
              currentPage: page,
              hasNextPage: page < lastPage,
              hasPrevPage: page > 1,
            },
          } as PaginationResult<any>
        },
        async exists<T, A>(
          this: T,
          x: Prisma.Exact<A, Pick<Prisma.Args<T, 'findFirst'>, 'where'>>,
        ): Promise<boolean> {
          if (typeof x !== 'object') {
            return false
          }
          if (!('where' in x)) {
            return false
          }
          const count = await (this as any).count({ where: x.where })

          return count > 0
        },
      },
    },
  })

  return extendedPrismaClient
}
export type extendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>
