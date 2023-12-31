import { AggregateTrpcRouter } from '@core/modules/aggregate/aggregate.trpc'
import { CategoryTRPCRouter } from '@core/modules/category/category.trpc'
import { CommentTrpcRouter } from '@core/modules/comment/comment.trpc'
import { ConfigsTRPCRouter } from '@core/modules/configs/configs.trpc'
import { HelpersTrpcRouter } from '@core/modules/helpers/helpers.trpc'
import { NoteTrpcRouter } from '@core/modules/note/note.trpc'
import { PageTrpcRouter } from '@core/modules/page/page.trpc'
import { PostTrpcRouter } from '@core/modules/post/post.trpc'
import { ToolTrpcRouter } from '@core/modules/tool/tool.trpc'
import { TopicTrpcRouter } from '@core/modules/topic/topic.trpc'
import { UserTrpcRouter } from '@core/modules/user/user.trpc'

export type tRpcRouters = [
  UserTrpcRouter,
  PostTrpcRouter,
  AggregateTrpcRouter,
  CategoryTRPCRouter,
  ConfigsTRPCRouter,
  HelpersTrpcRouter,
  NoteTrpcRouter,
  TopicTrpcRouter,
  CommentTrpcRouter,
  ToolTrpcRouter,
  PageTrpcRouter,
]
