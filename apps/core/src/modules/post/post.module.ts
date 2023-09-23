import { Module } from '@nestjs/common'

import { PostAdminController } from './post.admin.controller'
import { PostController } from './post.controller'
import { PostService } from './post.service'
import { PostTrpcRouter } from './post.trpc'

@Module({
  controllers: [PostController, PostAdminController],
  providers: [PostService, PostTrpcRouter],
  exports: [PostService, PostTrpcRouter],
})
export class PostModule {}
