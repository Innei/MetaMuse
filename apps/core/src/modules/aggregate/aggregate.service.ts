import { DatabaseService } from '@core/processors/database/database.service'
import { Inject, Injectable } from '@nestjs/common'

import { ReadAndLikeCountDocumentType } from './aggregate.dto'

@Injectable()
export class AggregateService {
  @Inject()
  private readonly databaseService: DatabaseService

  async getAllReadAndLikeCount(type: ReadAndLikeCountDocumentType) {
    let counts = {
      total_likes: 0n,
      total_reads: 0n,
    }

    const sqlRaw = (type: ReadAndLikeCountDocumentType) => {
      const typeToTableName = {
        [ReadAndLikeCountDocumentType.Post]: 'Post',
        [ReadAndLikeCountDocumentType.Note]: 'Note',
      }
      return this.databaseService.prisma.$queryRawUnsafe<(typeof counts)[]>(
        `SELECT
        SUM((count->>'like')::int) AS total_likes,
        SUM((count->>'read')::int) AS total_reads
    FROM  "${typeToTableName[type]}"
    WHERE count IS NOT NULL`,
      )
    }

    switch (type) {
      case ReadAndLikeCountDocumentType.Post: {
        const result = await sqlRaw(ReadAndLikeCountDocumentType.Post)

        if (result[0]) counts = result[0]

        break
      }
      case ReadAndLikeCountDocumentType.Note: {
        const result = await sqlRaw(ReadAndLikeCountDocumentType.Note)
        if (result[0]) counts = result[0]
        break
      }
      case ReadAndLikeCountDocumentType.All: {
        const results = await Promise.all([
          this.getAllReadAndLikeCount(ReadAndLikeCountDocumentType.Post),
          this.getAllReadAndLikeCount(ReadAndLikeCountDocumentType.Note),
        ])

        for (const result of results) {
          counts.total_likes += result.total_likes
          counts.total_reads += result.total_reads
        }
      }
    }

    return counts
  }

  async getAllSiteWordsCount() {
    const totalCharacters = await this.databaseService.prisma.$queryRaw<
      number[]
    >`
    SELECT SUM(LENGTH(text)) AS total
      FROM (
          SELECT text FROM "Post" WHERE text IS NOT NULL
          UNION ALL
          SELECT text FROM "Page" WHERE text IS NOT NULL
          UNION ALL
          SELECT text FROM "Note" WHERE text IS NOT NULL
      ) AS combined
`

    return totalCharacters[0]
  }
}
