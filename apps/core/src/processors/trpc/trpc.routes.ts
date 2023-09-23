import { PostTrpcRouter } from '@core/modules/post/post.trpc'
import { UserTrpcRouter } from '@core/modules/user/user.trpc'

export type tRpcRouters = [UserTrpcRouter, PostTrpcRouter]
