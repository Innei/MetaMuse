import { Module } from '@nestjs/common'

import { PostController } from './post.controller'
import { PostService } from './post.service'
import { PostTrpcRouter } from './post.trpc'

@Module({
  controllers: [PostController],
  providers: [PostService, PostTrpcRouter],
  exports: [PostService, PostTrpcRouter],
})
export class PostModule {}
