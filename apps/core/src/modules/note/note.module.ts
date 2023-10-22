import { forwardRef, Module } from '@nestjs/common'

import { TopicModule } from '../topic/topic.module'
import { NoteController } from './note.controller'
import { NotePublicService } from './note.public.service'
import { NoteService } from './note.service'
import { NoteTrpcRouter } from './note.trpc'

@Module({
  controllers: [NoteController],
  providers: [NoteService, NoteTrpcRouter, NotePublicService],
  exports: [NoteService, NoteTrpcRouter, NotePublicService],
  imports: [forwardRef(() => TopicModule)],
})
export class NoteModule {}
