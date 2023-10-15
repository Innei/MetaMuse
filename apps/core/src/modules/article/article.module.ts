import { Module } from '@nestjs/common'

import { ArticleService } from './article.service'

@Module({
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
