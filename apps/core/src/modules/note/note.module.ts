import { Module } from '@nestjs/common'

import { NoteController } from './note.controller'
import { NoteService } from './note.service'
import { NoteTrpcRouter } from './note.trpc'

@Module({
  controllers: [NoteController],
  providers: [NoteService, NoteTrpcRouter],
  exports: [NoteService, NoteTrpcRouter],
})
export class NoteModule {}
