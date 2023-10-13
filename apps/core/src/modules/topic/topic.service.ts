import { DatabaseService } from '@core/processors/database/database.service'
import { Injectable } from '@nestjs/common'

import { NoteIncluded } from '../note/note.protect'

@Injectable()
export class TopicService {
  constructor(private readonly db: DatabaseService) {}

  getNotesByTopicId(id: string) {
    return this.db.prisma.note.findMany({
      where: {
        topicId: id,
      },
      include: NoteIncluded,
    })
  }
}
