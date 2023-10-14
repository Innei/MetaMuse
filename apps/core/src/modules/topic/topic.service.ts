import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { Injectable, Logger } from '@nestjs/common'

import { NoteIncluded } from '../note/note.protect'

@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name)
  constructor(private readonly db: DatabaseService) {}

  getNotesByTopicId(id: string) {
    return this.db.prisma.note.findMany({
      where: {
        topicId: id,
      },
      include: NoteIncluded,
    })
  }

  async addNotesToTopic(topicId: string, noteIds: string[]) {
    const topic = await this.db.prisma.noteTopic.findUnique({
      where: {
        id: topicId,
      },
    })

    if (!topic) {
      throw new BizException(ErrorCodeEnum.NoteTopicNotFound)
    }

    const isNoteAllExist = await this.db.prisma.note.findMany({
      where: {
        id: {
          in: noteIds,
        },
      },
    })

    if (isNoteAllExist.length !== noteIds.length) {
      throw new BizException(ErrorCodeEnum.NoteNotFound)
    }

    await this.db.prisma.$transaction(async (prisma) => {
      for (const noteId of noteIds) {
        await prisma.note.update({
          where: {
            id: noteId,
          },
          data: {
            topic: {
              connect: {
                id: topicId,
              },
            },
          },
        })
      }
    })
  }

  async removeNotesFromTopic(topicId: string, noteIds: string[]) {
    const topic = await this.db.prisma.noteTopic.findUnique({
      where: {
        id: topicId,
      },
    })

    if (!topic) {
      throw new BizException(ErrorCodeEnum.NoteTopicNotFound)
    }

    await this.db.prisma.$transaction(async (prisma) => {
      for (const noteId of noteIds) {
        await prisma.note
          .update({
            where: {
              id: noteId,
            },
            data: {
              topic: {
                disconnect: {
                  id: topicId,
                },
              },
            },
          })
          .catch((err) => {
            this.logger.error(err)
          })
      }
    })
  }
}
