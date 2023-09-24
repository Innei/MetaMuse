import { forwardRef, Module } from '@nestjs/common'

import { CategoryModule } from '../category/category.module'
import { NoteModule } from '../note/note.module'
import { PageModule } from '../page/page.module'
import { PostModule } from '../post/post.module'
import { AggregateController } from './aggregate.controller'
import { AggregateTrpcRouter } from './aggregate.trpc'

@Module({
  controllers: [AggregateController],
  providers: [AggregateTrpcRouter],
  exports: [AggregateTrpcRouter],
  imports: [
    forwardRef(() => CategoryModule),
    forwardRef(() => PostModule),
    forwardRef(() => NoteModule),
    forwardRef(() => PageModule),
  ],
})
export class AggregateModule {}
