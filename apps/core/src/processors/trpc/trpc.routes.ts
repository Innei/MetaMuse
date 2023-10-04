import { AggregateTrpcRouter } from '@core/modules/aggregate/aggregate.trpc'
import { CategoryTRPCRouter } from '@core/modules/category/category.trpc'
import { ConfigsTRPCRouter } from '@core/modules/configs/configs.trpc'
import { HelpersTrpcRouter } from '@core/modules/helpers/helpers.trpc'
import { PostTrpcRouter } from '@core/modules/post/post.trpc'
import { UserTrpcRouter } from '@core/modules/user/user.trpc'

export type tRpcRouters = [
  UserTrpcRouter,
  PostTrpcRouter,
  AggregateTrpcRouter,
  CategoryTRPCRouter,
  ConfigsTRPCRouter,
  HelpersTrpcRouter,
]
