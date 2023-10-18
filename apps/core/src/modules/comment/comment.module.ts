import { Module } from '@nestjs/common'

import { ArticleModule } from '../article/article.module'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { CommentTrpcRouter } from './comment.trpc'

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommentTrpcRouter],
  imports: [ArticleModule],
  exports: [CommentService, CommentTrpcRouter],
})
export class CommentModule {}
