import { Union } from 'ts-toolbelt'

import { ArticleType } from '@core/constants/article.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { Note, Page, Post, Prisma, Recently } from '@meta-muse/prisma'
import { Injectable } from '@nestjs/common'

import { ConfigsService } from '../configs/configs.service'
import { NoteIncluded } from '../note/note.protect'
import { PostIncluded } from '../post/post.protect'

@Injectable()
export class ArticleService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configsService: ConfigsService,
  ) {}

  private readonly articleModels = [
    // NOTE: `console` tsc type check here will throw error
    // @ts-ignore
    this.databaseService.prisma.note,
    // @ts-ignore
    this.databaseService.prisma.page,
    // @ts-ignore
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

  async findArticleByType(
    type: ArticleType.Post,
    id: string,
  ): Promise<NormalizedPostModel>
  async findArticleByType(
    type: ArticleType.Note,
    id: string,
  ): Promise<NormalizedNoteModel>
  async findArticleByType(type: ArticleType.Page, id: string): Promise<Page>
  async findArticleByType(
    type: ArticleType.Recently,
    id: string,
  ): Promise<Recently>
  async findArticleByType(type: ArticleType, id: string) {
    switch (type) {
      case ArticleType.Note: {
        return await this.databaseService.prisma.note.findUnique({
          where: { id },
          include: NoteIncluded,
        })
      }
      case ArticleType.Page: {
        return await this.databaseService.prisma.page.findUnique({
          where: { id },
        })
      }
      case ArticleType.Post: {
        return await this.databaseService.prisma.post.findUnique({
          where: { id },
          include: PostIncluded,
        })
      }

      case ArticleType.Recently: {
        return await this.databaseService.prisma.recently.findUnique({
          where: { id },
        })
      }
    }
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

  async resolveUrlByType(type: ArticleType, model: any) {
    const {
      url: { webUrl: base },
    } = await this.configsService.waitForConfigReady()
    switch (type) {
      case ArticleType.Note: {
        return new URL(`/notes/${model.nid}`, base).toString()
      }
      case ArticleType.Page: {
        return new URL(`/${model.slug}`, base).toString()
      }
      case ArticleType.Post: {
        return new URL(`/${model.category.slug}/${model.slug}`, base).toString()
      }
      case ArticleType.Recently: {
        return new URL(`/recently/${model.id}`, base).toString()
      }
    }
  }
}
