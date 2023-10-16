import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EmailService } from '@core/processors/helper/services/helper.email.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { getAvatar } from '@core/shared/utils/tool.utils'
import {
  CommentRefTypes,
  CommentState,
  Note,
  Page,
  Post,
} from '@meta-muse/prisma'
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'

import { ArticleService } from '../article/article.service'
import { ConfigsService } from '../configs/configs.service'
import { UserSchemaSerializeProjection } from '../user/user.protect'
import { UserService } from '../user/user.service'
import { CreateCommentDto } from './comment.dto'
import { baseRenderProps } from './comment.email.default'
import { CommentReplyMailType } from './comment.enum'

@Injectable()
export class CommentService implements OnModuleInit {
  private readonly logger = new Logger(CommentService.name)
  @Inject()
  private readonly databaseService: DatabaseService

  @Inject()
  private readonly userService: UserService

  @Inject()
  private readonly emailService: EmailService

  @Inject()
  private readonly articleService: ArticleService

  @Inject()
  private readonly eventManager: EventManagerService

  @Inject()
  private readonly configsService: ConfigsService

  private async getMailOwnerProps() {
    const masterInfo = await this.userService.getOwner().catch(() => null)
    if (!masterInfo) return null
    return UserSchemaSerializeProjection.serialize(masterInfo)
  }

  async onModuleInit() {
    const ownerInfo = await this.getMailOwnerProps()
    if (!ownerInfo) {
      this.logger.warn('站长信息未初始化，注册评论发信模板失败')
      return
    }
    const renderProps = {
      ...baseRenderProps,

      master: ownerInfo.name,

      aggregate: {
        ...baseRenderProps.aggregate,
        owner: ownerInfo,
      },
    }
    this.emailService.registerEmailType(CommentReplyMailType.Guest, {
      ...renderProps,
    })
    this.emailService.registerEmailType(CommentReplyMailType.Owner, {
      ...renderProps,
    })
  }

  async notifyCommentEvent(
    type: BusinessEvents.COMMENT_CREATE | BusinessEvents.COMMENT_DELETE,
    id: string,
  ) {
    switch (type) {
      case BusinessEvents.COMMENT_CREATE: {
        const comment = await this.getCommentById(id)
        if (!comment) {
          return
        }
        this.eventManager.emit(type, comment, {
          scope: EventScope.TO_SYSTEM_ADMIN,
        })

        if (!comment.isWhispers) {
          this.eventManager.emit(type, comment, {
            scope: EventScope.TO_VISITOR,
          })
        }
        return
      }
      case BusinessEvents.COMMENT_DELETE: {
        this.eventManager.emit(
          type,
          { id },
          {
            scope: EventScope.ALL,
          },
        )
      }
    }
  }

  async getCommentById(id: string) {
    return this.databaseService.prisma.comment.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        children: true,
      },
    })
  }

  async createComment(articleId: string, doc: CreateCommentDto) {
    let ref: Post | Note | Page
    let type: CommentRefTypes
    const result = await this.articleService.findArticleById(articleId)
    if (result) {
      const { type: type_, result: document } = result
      ref = document as any
      type = type_ as any
    } else {
      throw new BizException(ErrorCodeEnum.ResourceNotFound, '评论文章不存在')
    }

    if (!ref.allowComment) {
      throw new BizException(ErrorCodeEnum.CommentBanned)
    }

    const commentIndex = ref.commentsIndex || 0
    const comment = await this.databaseService.prisma.comment.create({
      data: {
        ...doc,
        key: `#${commentIndex + 1}`,
        state: CommentState.UNREAD,
        refId: ref.id,
        refType: type,
      },
    })

    await this.articleService.incrementArticleCommentIndex(type as any, ref.id)
    this.notifyCommentEvent(BusinessEvents.COMMENT_CREATE, comment.id)
    return comment
  }

  async fillAndReplaceAvatarUrl(comments: NormalizedCommentModel[]) {
    const master = await this.userService.getOwner()

    comments.forEach(function process(comment) {
      if (typeof comment == 'string') {
        return
      }
      // 如果是 author 是站长，就用站长自己设定的头像替换
      if (comment.author === master.name) {
        comment.avatar = master.avatar || comment.avatar
      }

      // 如果不存在头像就
      if (!comment.avatar) {
        comment.avatar = getAvatar(comment.mail)
      }

      if (comment.children?.length) {
        comment.children.forEach((child) => {
          process(child as NormalizedCommentModel)
        })
      }

      return comment
    })

    return comments
  }

  async appendIpLocation(id: string, ip: string) {
    if (!ip) {
      return
    }
    const { recordIpLocation } = await this.configsService.get('commentOptions')

    if (!recordIpLocation) {
      return
    }

    const model = this.databaseService.prisma.comment.findUnique({
      where: {
        id,
      },
    })
    if (!model) {
      return
    }

    // TODO
    // const fnModel = (await this.serverlessService.model
    //   .findOne({
    //     name: 'ip',
    //     reference: 'built-in',
    //     type: SnippetType.Function,
    //   })
    //   .select('+secret')
    //   .lean({
    //     getters: true,
    //   })) as SnippetModel

    // if (!fnModel) {
    //   this.logger.error('[Serverless Fn] ip query function is missing.')
    //   return model
    // }

    // const result =
    //   await this.serverlessService.injectContextIntoServerlessFunctionAndCall(
    //     fnModel,
    //     {
    //       req: {
    //         query: { ip },
    //       },
    //       res: createMockedContextResponse({} as any),
    //     } as any,
    //   )

    // const location =
    //   `${result.countryName || ''}${
    //     result.regionName && result.regionName !== result.cityName
    //       ? `${result.regionName}`
    //       : ''
    //   }${result.cityName ? `${result.cityName}` : ''}` || undefined

    // if (location) await this.commentModel.updateOne({ _id: id }, { location })
  }
}
