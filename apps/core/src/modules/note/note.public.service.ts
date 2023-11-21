import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { Prisma } from '@meta-muse/prisma'
import { Inject, Injectable } from '@nestjs/common'

import { NoteIncluded } from './note.protect'
import { NoteService } from './note.service'

@Injectable()
export class NotePublicService {
  @Inject()
  private readonly db: DatabaseService
  @Inject()
  private readonly service: NoteService

  public static notePublicFilter = {
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
  } satisfies Prisma.NoteWhereInput

  async getLatestNoteId() {
    const res = await this.db.prisma.note.findFirst({
      orderBy: {
        nid: 'desc',
      },
      select: {
        nid: true,
      },
      where: NotePublicService.notePublicFilter,
    })

    if (!res) return null
    return res.nid
  }

  async getNoteById(id: string | number) {
    return this.db.prisma.note
      .findUniqueOrThrow({
        where: {
          id: typeof id === 'string' ? id : undefined,
          nid: typeof id === 'number' ? id : undefined,

          ...NotePublicService.notePublicFilter,
        },
        include: NoteIncluded,
      })
      .catch(
        resourceNotFoundWrapper(new BizException(ErrorCodeEnum.NoteNotFound)),
      )
  }
}
