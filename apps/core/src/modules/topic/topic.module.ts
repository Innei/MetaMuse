import { Module } from '@nestjs/common'

import { TopicController } from './topic.controller'

@Module({
  controllers: [TopicController],
})
export class TopicModule {}
