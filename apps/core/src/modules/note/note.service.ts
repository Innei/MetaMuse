import { noop, omit, pick } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { ImageService } from '@core/processors/helper/services/helper.image.service'
import { reorganizeData, toOrder } from '@core/shared/utils/data.util'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { scheduleManager } from '@core/shared/utils/schedule.util'
import { getLessThanNow } from '@core/shared/utils/time.util'
import { CommentRefTypes, Prisma } from '@meta-muse/prisma'
import { forwardRef, Inject, Injectable } from '@nestjs/common'

import { TopicService } from '../topic/topic.service'
import { NoteDto, NotePagerDto, NotePatchDto } from './note.dto'
import { NoteIncluded } from './note.protect'

@Injectable()
export class NoteService {
  @Inject()
  private readonly db: DatabaseService

  @Inject()
  private readonly eventService: EventManagerService

  @Inject(forwardRef(() => TopicService))
  private readonly topicService: TopicService

  @Inject(ImageService)
  private readonly imageService: ImageService

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
      year,
    } = options

    if (year) {
      filter = {
        ...filter,
        created: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year}-12-31`),
        },
      }
    }

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

  async getNoteById(id: string | number) {
    return this.db.prisma.note
      .findUniqueOrThrow({
        where: {
          id: typeof id === 'string' ? id : undefined,
          nid: typeof id === 'number' ? id : undefined,
        },
        include: NoteIncluded,
      })
      .catch(
        resourceNotFoundWrapper(new BizException(ErrorCodeEnum.NoteNotFound)),
      )
  }

  async queryNoteRanking(id: string, size: number, queryAll: boolean) {
    const base = await this.getNoteById(id).catch(() => null)

    if (!base) {
      return {
        data: [],
        size: 0,
      }
    }

    const filterOption: Prisma.NoteWhereInput = queryAll
      ? {}
      : {
          isPublished: true,
          OR: [
            {
              publicAt: {
                lte: new Date(),
              },
            },
            {
              publicAt: null,
            },
          ],
        }

    const halfSize = size >> 1

    const allowedKeys = ['nid', 'id', 'title', 'created'] as const

    const baseFindManyArgs = {
      where: {
        ...filterOption,
      },
      select: {
        nid: true,
        id: true,
        title: true,
        created: true,
      },
      orderBy: {
        created: 'desc',
      },
      take: halfSize - 1,
    } satisfies Prisma.NoteFindManyArgs

    const leadingListArgs = {
      ...baseFindManyArgs,
      where: {
        created: {
          gt: base.created,
        },
        ...filterOption,
      },
    } satisfies Prisma.NoteFindManyArgs

    const tailingListArgs = {
      ...baseFindManyArgs,
      where: {
        created: {
          lt: base.created,
        },
        ...filterOption,
      },
    } satisfies Prisma.NoteFindManyArgs

    const leadingList =
      halfSize - 1 === 0
        ? []
        : await this.db.prisma.note.findMany(leadingListArgs)

    const tailingList = !halfSize
      ? []
      : await this.db.prisma.note.findMany(tailingListArgs)

    const safeBaseNote = pick(base, allowedKeys)
    const data = [...leadingList, safeBaseNote, ...tailingList].sort((a, b) => {
      return new Date(a.created).getTime() - new Date(b.created).getTime()
    })
    return {
      data,
      size: data.length,
    }
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
          await this.eventService.emit(BusinessEvents.NOTE_UPDATE, doc, {
            scope: EventScope.TO_VISITOR,
          })
        }
        await this.eventService.emit(BusinessEvents.NOTE_UPDATE, doc, {
          scope: EventScope.TO_SYSTEM,
        })
        break
      }
      case BusinessEvents.NOTE_DELETE:
        await this.eventService.emit(
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
      input.created = getLessThanNow(dto.custom_created)
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

  // TODO
  updateById = this.updateBypass

  private async updateBypass(id: string, data: NotePatchDto) {
    // TODO check topic
    return this.db.prisma.note.update({
      where: {
        id,
      },
      data: this.dtoToModel(data, 'update'),
    })
  }

  async create(data: NoteDto) {
    if (data.topicId) {
      const isTopicExist = await this.topicService.checkTopicExist(data.topicId)
      if (!isTopicExist) {
        throw new BizException(ErrorCodeEnum.NoteTopicNotFound)
      }
    }

    const note = await this.db.prisma.note.create({
      data: {
        ...this.dtoToModel(data, 'create'),
        meta: data.meta,
      },
    })

    scheduleManager.batch(() =>
      Promise.all([
        this.notifyNoteUpdate(BusinessEvents.NOTE_CREATE, note.id),
        this.imageService.saveImageDimensionsFromMarkdownText(
          data.text,
          data.images,
          (images) => {
            return this.updateBypass(note.id, {
              images,
            })
          },
        ),
      ]),
    )

    return note
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
