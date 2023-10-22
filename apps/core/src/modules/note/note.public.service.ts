import { DatabaseService } from '@core/processors/database/database.service'
import { Inject, Injectable } from '@nestjs/common'

import { NoteService } from './note.service'

@Injectable()
export class NotePublicService {
  @Inject()
  private readonly db: DatabaseService
  @Inject()
  private readonly service: NoteService

  async getLatestNoteId() {
    const res = await this.db.prisma.note.findFirst({
      orderBy: {
        nid: 'desc',
      },
      select: {
        nid: true,
      },
      where: {
        isPublished: true,
        OR: [
          {
            publicAt: {
              gt: new Date(),
            },
          },
          {
            publicAt: null,
          },
        ],

        password: {
          equals: '',
        },
      },
    })

    if (!res) return null
    return res.nid
  }
}
