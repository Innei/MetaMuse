import { noop, omit } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { reorganizeData, toOrder } from '@core/shared/utils/data.util'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { CommentRefTypes, Prisma } from '@meta-muse/prisma'
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
      cursor,
    } = options

    const data = await this.db.prisma.note.paginate(
      {
        include: NoteIncluded,
        where: filter,
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: [
          {
            [sortBy]: toOrder(sortOrder),
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
        include: NoteIncluded,
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
    switch (type) {
      case BusinessEvents.NOTE_CREATE:
      case BusinessEvents.NOTE_UPDATE: {
        const doc = await this.getNoteById(id).catch(noop)
        if (!doc) return
        if (!doc.password && doc.isPublished) {
          if (doc.publicAt && doc.publicAt.getTime() > Date.now()) {
            return
          }
          this.eventService.emit(BusinessEvents.NOTE_UPDATE, doc, {
            scope: EventScope.TO_VISITOR,
          })
        }
        this.eventService.emit(BusinessEvents.NOTE_UPDATE, doc, {
          scope: EventScope.TO_SYSTEM,
        })
        break
      }
      case BusinessEvents.NOTE_DELETE:
        this.eventService.emit(
          BusinessEvents.NOTE_DELETE,
          { id },
          { scope: EventScope.ALL },
        )
        break
    }
  }

  private dtoToModel(dto: NoteDto, type: 'create'): Prisma.NoteCreateInput
  private dtoToModel(dto: NotePatchDto, type: 'update'): Prisma.NoteUpdateInput
  private dtoToModel(
    dto: NoteDto | NotePatchDto,
    type: 'create' | 'update',
  ): Prisma.NoteCreateInput | Prisma.NoteUpdateInput {
    const input = {
      ...omit(dto, 'modified', 'custom_created', 'topicId'),
    } as Prisma.NoteCreateInput | Prisma.NoteUpdateInput

    const setOrConnect = type === 'create' ? 'connect' : 'set'

    if (dto.custom_created) {
      input.created = dto.custom_created
    }

    if (dto.topicId) {
      input.topic = {
        connect: {
          id: dto.topicId,
        },
      }
    }

    return input
  }

  async updateById(id: string, data: NotePatchDto) {
    // TODO check topic
    return this.db.prisma.note.update({
      where: {
        id,
      },
      data: this.dtoToModel(data, 'update'),
    })
  }

  async create(data: NoteDto) {
    // TODO check topic
    return this.db.prisma.note.create({
      data: {
        ...this.dtoToModel(data, 'create'),
        meta: data.meta,
      },
    })
  }

  async deleteById(id: string) {
    this.db.prisma.$transaction(async (prisma) => {
      await this.db.prisma.note.delete({
        where: {
          id,
        },
      })
      await prisma.comment.deleteMany({
        where: {
          refType: CommentRefTypes.Post,
          refId: id,
        },
      })
    })
  }
}
