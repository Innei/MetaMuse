import { BizException } from '@core/common/exceptions/biz.exception'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EmailService } from '@core/processors/helper/services/helper.email.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import {
  CommentRefTypes,
  CommentState,
  Note,
  Page,
  Post,
} from '@meta-muse/prisma'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { ArticleService } from '../article/article.service'
import { UserSchemaSerializeProjection } from '../user/user.protect'
import { UserService } from '../user/user.service'
import { CreateCommentDto } from './comment.dto'
import { baseRenderProps } from './comment.email.default'
import { CommentReplyMailType } from './comment.enum'

@Injectable()
export class CommentService implements OnModuleInit {
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

  private async getMailOwnerProps() {
    const masterInfo = await this.userService.getOwner()
    return UserSchemaSerializeProjection.serialize(masterInfo)
  }

  async onModuleInit() {
    const ownerInfo = await this.getMailOwnerProps()
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
}
