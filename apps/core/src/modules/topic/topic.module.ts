import { Module } from '@nestjs/common'

import { TopicController } from './topic.controller'
import { TopicService } from './topic.service'
import { TopicTrpcRouter } from './topic.trpc'

@Module({
  controllers: [TopicController],
  exports: [TopicTrpcRouter, TopicService],
  providers: [TopicTrpcRouter, TopicService],
})
export class TopicModule {}
