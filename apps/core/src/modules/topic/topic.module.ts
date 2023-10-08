import { Module } from '@nestjs/common'

import { TopicController } from './topic.controller'
import { TopicTrpcRouter } from './topic.trpc'

@Module({
  controllers: [TopicController],
  exports: [TopicTrpcRouter],
  providers: [TopicTrpcRouter],
})
export class TopicModule {}
