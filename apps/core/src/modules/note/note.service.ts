import { omit } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/helper.event.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { reorganizeData } from '@core/utils/data.util'
import { Prisma } from '@meta-muse/prisma'
import { Inject, Injectable } from '@nestjs/common'

import { NoteDto, NotePagerDto, NotePatchDto } from './note.dto'
import { NoteIncluded } from './note.protect'

@Injectable()
export class NoteService {
  @Inject()
  private readonly db: DatabaseService

  @Inject()
  private readonly eventService: EventManagerService

  async paginateNotes(
    options: NotePagerDto,
    filter: Prisma.NoteWhereInput = {},
  ) {
    const {
      select,
      exclude,
      size = 10,
      page = 1,
      sortBy = 'created',
      sortOrder = -1,
    } = options
    const nextSortOrder = {
      ['-1']: 'desc',
      [1]: 'asc',
    }[sortOrder.toString()]

    const data = await this.db.prisma.note.paginate(
      {
        include: NoteIncluded,
        where: filter,

        orderBy: [
          {
            [sortBy]: nextSortOrder,
          },
        ],
      },
      {
        size,
        page,
      },
    )

    data.data = reorganizeData(data.data, select, exclude)
    return data
  }

  async getNoteById(id: string) {
    return this.db.prisma.note
      .findUniqueOrThrow({
        where: {
          id,
        },
      })
      .catch(
        resourceNotFoundWrapper(new BizException(ErrorCodeEnum.NoteNotFound)),
      )
  }

  async getLatestNoteId() {
    return this.db.prisma.note
      .findFirst({
        orderBy: {
          nid: 'desc',
        },
        select: {
          nid: true,
        },
      })
      .then((res) => {
        if (!res) return null

        return res.nid
      })
  }

  async notifyNoteUpdate(
    type:
      | BusinessEvents.NOTE_CREATE
      | BusinessEvents.NOTE_UPDATE
      | BusinessEvents.NOTE_DELETE,
    id: string,
  ) {
    // TODO
    switch (type) {
      case BusinessEvents.NOTE_CREATE:
      case BusinessEvents.NOTE_UPDATE:
        break
      case BusinessEvents.NOTE_DELETE:
        break
    }
  }

  private dtoToPost(dto: NoteDto, type: 'create'): Prisma.NoteCreateInput
  private dtoToPost(dto: NotePatchDto, type: 'update'): Prisma.NoteUpdateInput
  private dtoToPost(
    dto: NoteDto | NotePatchDto,
    type: 'create' | 'update',
  ): Prisma.NoteCreateInput | Prisma.NoteUpdateInput {
    const input = {
      ...omit(dto, 'modified', 'custom_created'),
    } as Prisma.PostCreateInput | Prisma.PostUpdateInput

    const setOrConnect = type === 'create' ? 'connect' : 'set'

    if (dto.custom_created) {
      input.created = dto.custom_created
    }

    return input
  }

  async updateById(id: string, data: NotePatchDto) {
    // TODO check topic
    return this.db.prisma.note.update({
      where: {
        id,
      },
      data: this.dtoToPost(data, 'update'),
    })
  }

  async create(data: NoteDto) {
    // TODO check topic
    return this.db.prisma.note.create({
      data: {
        ...this.dtoToPost(data, 'create'),
        meta: data.meta,
      },
    })
  }

  async deleteById(id: string) {
    return this.db.prisma.note.delete({
      where: {
        id,
      },
    })
  }
}
