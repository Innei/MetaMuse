import { DatabaseService } from '@core/processors/database/database.service'
import { Prisma } from '@meta-muse/prisma'
import { Inject, Injectable } from '@nestjs/common'

import { NotePagerDto } from './note.dto'
import { NoteIncluded } from './note.protect'

@Injectable()
export class NoteService {
  @Inject()
  private readonly db: DatabaseService

  async paginateNotes(
    options: NotePagerDto,
    filter: Prisma.NoteWhereInput = {},
  ) {
    const {
      select,
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

    if (select?.length) {
      const nextData = [] as typeof data.data
      for (const item of data.data) {
        if (!item) continue
        const currentItem = {} as any
        for (const key of select) {
          currentItem[key] = item[key]
        }
        nextData.push(currentItem)
      }

      data.data = nextData
    }

    return data
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
}
