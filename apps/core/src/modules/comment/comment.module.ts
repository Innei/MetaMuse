import { Module } from '@nestjs/common'

import { ArticleModule } from '../article/article.module'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [ArticleModule],
})
export class CommentModule {}
