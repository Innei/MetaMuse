import ejs from 'ejs'
import { pick } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { ArticleType } from '@core/constants/article.constant'
import { BusinessEvents } from '@core/constants/business-event.constant'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { isDev } from '@core/global/env.global'
import {
  DatabaseService,
  sql,
} from '@core/processors/database/database.service'
import { EmailService } from '@core/processors/helper/services/helper.email.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { IpService } from '@core/processors/helper/services/helper.ip.service'
import { PagerDto } from '@core/shared/dto/pager.dto'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { hasChinese } from '@core/shared/utils/tool.util'
import { getAvatar } from '@core/shared/utils/tool.utils'
import {
  $Enums,
  Comment,
  CommentRefTypes,
  CommentState,
  Note,
  Page,
  Post,
  Prisma,
} from '@meta-muse/prisma'
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'

import { ArticleService } from '../article/article.service'
import { ConfigsService } from '../configs/configs.service'
import { UserSchemaSerializeProjection } from '../user/user.protect'
import { UserService } from '../user/user.service'
import BlockedKeywords from './block-keywords'
import { CreateCommentWithAgentDto } from './comment.dto'
import {
  baseRenderProps,
  CommentEmailTemplateRenderProps,
  CommentModelRenderProps,
  defaultCommentModelKeys,
} from './comment.email.default'
import { CommentReplyMailType, CommentSenderType } from './comment.enum'
import { CommentInclude } from './comment.protect'

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

  @Inject()
  private readonly ipService: IpService

  private async getMailOwnerProps() {
    const masterInfo = await this.userService.getOwner().catch(() => null)
    if (!masterInfo) return null
    return UserSchemaSerializeProjection.serialize(masterInfo)
  }

  async onModuleInit() {
    const ownerInfo = await this.getMailOwnerProps()
    // TODO
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

  async paginate(
    options: Partial<PagerDto> & {
      state:
        | $Enums.CommentState
        | Prisma.EnumCommentStateNullableFilter<'Comment'>
      articleId?: string
    },
  ) {
    const {
      page = 1,
      size = 20,
      sortBy = 'created',
      cursor,
      sortOrder = 'desc',
      state,
      articleId,
    } = options

    return this.databaseService.prisma.comment.paginate(
      {
        where: {
          state,
          refId: articleId ? articleId : undefined,
        },
        include: CommentInclude,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          [sortBy]: sortOrder,
        },
      },
      {
        page,
        size,
      },
    )
  }

  async paginateCommentsForPublic(articleId: string, options: PagerDto) {
    const configs = await this.configsService.get('commentOptions')
    const { commentShouldAudit } = configs
    const { page, size, sortBy, cursor, sortOrder } = options

    return this.paginate({
      page,
      state: commentShouldAudit
        ? CommentState.READ
        : {
            in: [CommentState.READ, CommentState.UNREAD],
          },
      cursor,
      sortBy,
      size,
      sortOrder,
      articleId,
    })
  }

  async notifyCommentEvent(
    type: BusinessEvents.COMMENT_CREATE | BusinessEvents.COMMENT_DELETE,
    id: string,
  ) {
    const { commentShouldAudit } =
      await this.configsService.get('commentOptions')

    switch (type) {
      case BusinessEvents.COMMENT_CREATE: {
        const comment = await this.getCommentById(id)
        if (!comment) {
          return
        }
        this.eventManager.emit(type, comment, {
          scope: EventScope.TO_SYSTEM_ADMIN,
        })

        if (comment.isWhispers) return
        if (comment.state === CommentState.UNREAD && commentShouldAudit) return

        this.eventManager.emit(type, comment, {
          scope: EventScope.TO_VISITOR,
        })
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
      include: CommentInclude,
    })
  }

  async checkSpam(doc: Comment) {
    const res = await (async () => {
      const commentOptions = await this.configsService.get('commentOptions')
      if (!commentOptions.antiSpam) {
        return false
      }
      const master = await this.userService.getOwner()
      if (doc.author === master.username) {
        return false
      }
      if (commentOptions.blockIps) {
        if (!doc.ip) {
          return false
        }
        const isBlock = commentOptions.blockIps.some((ip) =>
          // @ts-ignore
          new RegExp(ip, 'ig').test(doc.ip),
        )
        if (isBlock) {
          return true
        }
      }

      const customKeywords = commentOptions.spamKeywords || []
      const isBlock = [...customKeywords, ...BlockedKeywords].some((keyword) =>
        new RegExp(keyword, 'ig').test(doc.text),
      )

      if (isBlock) {
        return true
      }

      if (commentOptions.disableNoChinese && !hasChinese(doc.text)) {
        return true
      }

      return false
    })()
    if (res) {
      this.logger.warn(
        '--> 检测到一条垃圾评论：' +
          `作者：${doc.author}, IP: ${doc.ip}, 内容为：${doc.text}`,
      )
    }
    return res
  }

  async createComment({
    articleId,
    doc,
    parentCommentId,
    mentionIds,
    senderType,
  }: {
    articleId: string
    doc: CreateCommentWithAgentDto
    parentCommentId?: string
    mentionIds?: string[]
    senderType?: CommentSenderType
  }) {
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
        state: senderType === 'owner' ? CommentState.READ : CommentState.UNREAD,
        refId: ref.id,
        refType: type,
        parentId: parentCommentId,
        mentions: mentionIds,
      },
      include: {
        ...CommentInclude,
        parent: true,
      },
    })

    await this.articleService.incrementArticleCommentIndex(type as any, ref.id)
    this.notifyCommentEvent(BusinessEvents.COMMENT_CREATE, comment.id)

    this.checkAndMarkCommentAsSpam(comment).then((isSpam) => {
      if (isSpam) return
      this.notifyCommentEvent(BusinessEvents.COMMENT_CREATE, comment.id)
    })

    return comment
  }
  async validateComment(
    doc: CreateCommentWithAgentDto,
    senderType: CommentSenderType,
    owner: Owner,
  ) {
    const { disableComment } = await this.configsService.get('commentOptions')

    if (disableComment) {
      throw new BizException(ErrorCodeEnum.CommentBanned)
    }

    if (senderType === 'guest') {
      if (
        doc.mail === owner.mail ||
        doc.author === owner.name ||
        doc.author === owner.username
      ) {
        throw new BizException(ErrorCodeEnum.CommentConflict)
      }
    }
  }

  async createBaseComment(
    articleId: string,
    doc: CreateCommentWithAgentDto,
    senderType: CommentSenderType,
  ) {
    const owner = await this.userService.getOwner()
    await this.validateComment(doc, senderType, owner)
    const newComment = await this.createComment({
      articleId,
      doc,
      senderType,
    })

    if (owner.mail === newComment.mail) return newComment

    await this.sendEmail(newComment, CommentReplyMailType.Owner)
    return newComment
  }

  async createThreadComment(
    parentId: string,
    doc: CreateCommentWithAgentDto,
    senderType: CommentSenderType,
  ) {
    const owner = await this.userService.getOwner()
    await this.validateComment(doc, senderType, owner)

    const { refId: articleId } = await this.databaseService.prisma.comment
      .findUniqueOrThrow({
        where: {
          id: parentId,
        },
        select: {
          refId: true,
        },
      })
      .catch(
        resourceNotFoundWrapper(
          new BizException(ErrorCodeEnum.CommentNotFound),
        ),
      )

    const [root] = (await sql`WITH RECURSIVE root_comments AS (
    SELECT id, "Comment"."parentId" as parentId
    FROM public."Comment"
    WHERE id = ${parentId}
    UNION ALL
    SELECT c.id, c."parentId" as parentId
    FROM public."Comment" c
    JOIN root_comments rc ON c.id = rc.parentId
)
SELECT id 
FROM root_comments 
WHERE parentId IS NULL;`) as { id: string }[]

    if (!root)
      throw new BizException(
        ErrorCodeEnum.CommentNotFound,
        'root comment not found',
      )
    const rootId = root.id
    const newComment = await this.createComment({
      articleId,
      doc,
      parentCommentId: rootId,
      mentionIds: [parentId],
      senderType,
    })

    const parentComment = await this.databaseService.prisma.comment.findUnique({
      where: {
        id: parentId,
      },
    })
    if (parentComment && parentComment?.mail !== owner.mail) {
      await this.sendEmail(
        newComment,
        CommentReplyMailType.Guest,
        parentComment?.mail,
      )
    }

    if (owner.mail === newComment.mail) return newComment

    await this.sendEmail(newComment, CommentReplyMailType.Owner)
    return newComment
  }

  checkAndMarkCommentAsSpam(comment: Comment) {
    return new Promise<boolean>((resolve) => {
      this.configsService.get('commentOptions').then((o) => {
        if (!o.antiSpam) {
          resolve(true)
          return
        }
        this.checkSpam(comment).then(async (isSpam) => {
          if (isSpam) {
            await this.databaseService.prisma.comment.update({
              where: {
                id: comment.id,
              },
              data: {
                state: CommentState.SPAM,
              },
            })
          }
          resolve(isSpam)
        })
      })
    })
  }

  async sendEmail(
    comment: Comment,
    type: CommentReplyMailType.Owner,
  ): Promise<void>
  async sendEmail(
    comment: Comment,
    type: CommentReplyMailType.Guest,
    to: string,
  ): Promise<void>
  async sendEmail(comment: Comment, type: CommentReplyMailType, to?: string) {
    const enable = await this.configsService
      .get('mailOptions')
      .then((config) => config.enable)
    if (!enable) {
      return
    }

    const masterInfo = await this.userService.getOwner()

    const refType = comment.refType
    const refResult = await this.articleService.findArticleById(comment.refId)
    if (!refResult) {
      this.logger.warn(
        `Send email failed: ref doc not found, refId: ${comment.refId}, refType: ${comment.refType}`,
      )
      return
    }
    const { result: refDoc } = refResult
    const time = new Date(comment.created)
    const parent: Comment | null = comment.parentId
      ? await this.databaseService.prisma.comment.findUnique({
          where: {
            id: comment.parentId,
          },
        })
      : null

    const parsedTime = `${time.getDate()}/${
      time.getMonth() + 1
    }/${time.getFullYear()}`

    if (!refResult || !masterInfo.mail) {
      return
    }

    const nextTo = type === CommentReplyMailType.Owner ? masterInfo.mail : to
    if (!nextTo) return

    this.sendCommentNotificationMail({
      to: nextTo,
      type,
      source: {
        title: refType === CommentRefTypes.Recently ? '速记' : refDoc.title,
        text: comment.text,
        author:
          type === CommentReplyMailType.Guest ? parent!.author : comment.author,
        master: masterInfo.name,
        link: await this.articleService
          .resolveUrlByType(
            this.commentRefTypeToArticleType(refType),
            refResult,
          )
          .then((url) => `${url}#comments-${comment.id}`),
        time: parsedTime,
        mail:
          CommentReplyMailType.Owner === type ? comment.mail : masterInfo.mail,
        ip: comment.ip || '',

        aggregate: {
          owner: masterInfo,
          commentor: {
            ...pick(comment, defaultCommentModelKeys),
            created: new Date(comment.created!).toISOString(),
            isWhispers: comment.isWhispers || false,
          } as CommentModelRenderProps,
          parent,
          post: {
            title: refDoc.title,
            created: new Date(refDoc.created!).toISOString(),
            id: refDoc.id!,
            modified: refDoc.modified
              ? new Date(refDoc.modified!).toISOString()
              : null,
            text: refDoc.text,
          },
        },
      },
    })
  }

  private commentRefTypeToArticleType(refType: CommentRefTypes): ArticleType {
    return {
      [CommentRefTypes.Post]: ArticleType.Post,
      [CommentRefTypes.Note]: ArticleType.Note,
      [CommentRefTypes.Page]: ArticleType.Page,
      [CommentRefTypes.Recently]: ArticleType.Recently,
    }[refType]
  }
  async fillAndReplaceAvatarUrl<
    T extends {
      avatar?: string | null
      mail?: string
      children?: any[]

      author?: string
    },
  >(comments: T[]): Promise<T[]> {
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
          process(child)
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

    const result = await this.ipService.fetchIpInfo(ip)

    const location =
      `${result.countryName || ''}${
        result.regionName && result.regionName !== result.cityName
          ? `${result.regionName}`
          : ''
      }${result.cityName ? `${result.cityName}` : ''}` || undefined

    if (location)
      await this.databaseService.prisma.comment.update({
        where: { id },
        data: { location },
      })
  }

  async sendCommentNotificationMail({
    to,
    source,
    type,
  }: {
    to: string
    source: Pick<
      CommentEmailTemplateRenderProps,
      keyof CommentEmailTemplateRenderProps
    >
    type: CommentReplyMailType
  }) {
    const { seo, mailOptions } = await this.configsService.waitForConfigReady()
    const { user } = mailOptions
    const from = `"${seo.title || 'Mx Space'}" <${user}>`

    source.ip ??= ''
    if (type === CommentReplyMailType.Guest) {
      const options = {
        from,
        subject: `[${seo.title || 'Mx Space'}] 主人给你了新的回复呐`,
        to,
        html: ejs.render(
          (await this.emailService.readTemplate(type)) as string,
          source,
        ),
      }
      if (isDev) {
        // @ts-ignore
        delete options.html
        Object.assign(options, { source })
        this.logger.log(options)
        return
      }
      await this.emailService.send(options)
    } else {
      const options = {
        from,
        subject: `[${seo.title || 'Mx Space'}] 有新回复了耶~`,
        to,
        html: ejs.render(
          (await this.emailService.readTemplate(type)) as string,
          source,
        ),
      }
      if (isDev) {
        // @ts-ignore
        delete options.html
        Object.assign(options, { source })
        this.logger.log(options)
        return
      }
      await this.emailService.send(options)
    }
  }

  async deleteComment(id: string) {
    await this.databaseService.prisma.comment.delete({
      where: {
        id,
      },
    })
    this.notifyCommentEvent(BusinessEvents.COMMENT_DELETE, id)

    // this.databaseService.prisma.comment.updateMany({
    //   where: {
    //     mentions: {
    //       has: id,
    //     },
    //   },
    //   data: {
    //     mentions: {
    //       set: [],
    //     },
    //   },
    // })
  }

  async changeState(id: string, state: CommentState) {
    return this.databaseService.prisma.comment.update({
      where: {
        id,
      },
      data: {
        state,
      },
    })
  }
}
