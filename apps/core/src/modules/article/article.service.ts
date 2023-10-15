import { Union } from 'ts-toolbelt'

import { DatabaseService } from '@core/processors/database/database.service'
import { Note, Page, Post, Prisma } from '@meta-muse/prisma'
import { Injectable } from '@nestjs/common'

enum ArticleType {
  Note = 'Note',
  Page = 'Page',
  Post = 'Post',
}

@Injectable()
export class ArticleService {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly articleModels = [
    this.databaseService.prisma.note,
    this.databaseService.prisma.page,
    this.databaseService.prisma.post,
  ] as const

  private readonly articleTypes = [
    ArticleType.Note,
    ArticleType.Page,
    ArticleType.Post,
  ] as const

  async findArticleById(id: string) {
    const results = await Promise.all(
      this.articleModels.map(async (model, index) => {
        return await model
          // @ts-ignore
          .findUnique({
            where: { id },
          })
          .then((result: any) => {
            if (!result) return null
            return {
              type: this.articleTypes[index],
              result,
            }
          })
      }),
    )

    return results.find((result) => result !== null) as Union.Nullable<
      | {
          type: ArticleType.Note
          result: Note
        }
      | {
          type: ArticleType.Page
          result: Page
        }
      | {
          type: ArticleType.Post
          result: Post
        }
    >
  }

  private async updateArticle(
    type: ArticleType,
    id: string,
    data:
      | Prisma.NoteUpdateInput
      | Prisma.PageUpdateInput
      | Prisma.PostUpdateInput,
  ) {
    return await this.databaseService.prisma[type.toLowerCase()].update({
      where: { id },
      data,
    })
  }
  async incrementArticleCommentIndex(type: ArticleType, id: string) {
    return await this.updateArticle(type, id, {
      commentsIndex: {
        increment: 1,
      },
    })
  }
}
