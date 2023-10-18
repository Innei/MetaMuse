import { pick } from 'lodash'

import { ArticleService } from '@core/modules/article/article.service'
import { CommentService } from '@core/modules/comment/comment.service'
import { UserService } from '@core/modules/user/user.service'
import { sleep } from '@core/shared/utils/tool.utils'
import { createMockGlobalModule } from '@test/helper/create-mock-global-module'
import { createServiceUnitTestApp } from '@test/helper/create-service-unit'
import { prisma } from '@test/lib/prisma'
import resetDb from '@test/lib/reset-db'
import { mockCommentData } from '@test/mock/data/comment.data'
import { generateMockNote } from '@test/mock/data/note.data'
import { mockUserInputData1 } from '@test/mock/data/user.data'
import { mockedEmailServiceProvider } from '@test/mock/helper/helper.email'
import { mockedEventManagerService } from '@test/mock/helper/helper.event'

describe('/modules/comment/comment.service', () => {
  const proxy = createServiceUnitTestApp(CommentService, {
    imports: [
      createMockGlobalModule([
        ArticleService,
        mockedEmailServiceProvider,
        UserService,
      ]),
    ],
  })

  beforeEach(async () => {
    await resetDb()
    await prisma.user.create({
      data: mockUserInputData1,
    })
  })

  test('create comment', async () => {
    const spy = vi.spyOn(CommentService.prototype, 'sendEmail')
    const note = await prisma.note.create({
      data: {
        ...generateMockNote(),
      },
    })
    const comment = await proxy.service.createBaseComment(
      note.id,
      mockCommentData,
      'guest',
    )

    expect(comment.refId).toBe(note.id)
    expect(comment.refType).toBe('Note')
    expect(comment.state).toMatchInlineSnapshot('"UNREAD"')
    expect(pick(comment, ['author', 'avatar', 'mail', 'source', 'text', 'url']))
      .toMatchInlineSnapshot(`
      {
        "author": "test",
        "avatar": null,
        "mail": "i@innei.in",
        "source": null,
        "text": "test",
        "url": null,
      }
    `)
    await sleep(10)
    expect(mockedEventManagerService.emit).toBeCalledTimes(2)
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith(expect.anything(), 'owner')
  })

  test('create reply comment', async () => {
    const spy = vi.spyOn(CommentService.prototype, 'sendEmail')
    const note = await prisma.note.create({
      data: {
        ...generateMockNote(),
      },
    })
    const comment = await proxy.service.createComment(note.id, mockCommentData)
    const replyComment = await proxy.service.createThreadComment(
      comment.id,
      mockCommentData,
      'guest',
    )
    expect(replyComment.refId).toBe(note.id)

    const reply = await prisma.comment.findUnique({
      where: {
        id: replyComment.id,
      },
    })

    expect(reply?.parentId).toBe(comment.id)
    expect(reply?.mentions.includes(comment.id)).toBeTruthy()

    const reComment = prisma.comment.findUnique({ where: { id: comment.id } })
    expect(reComment.children.length).toBe(1)

    expect(spy).toBeCalledTimes(2)
    expect(spy.mock.calls[1]).toEqual([expect.anything(), 'owner'])
    expect(spy.mock.calls[0]).toEqual([
      expect.anything(),
      'guest',
      mockCommentData.mail,
    ])
  })

  test('create reply comment reply comment', async () => {
    const spy = vi.spyOn(CommentService.prototype, 'sendEmail')
    const note = await prisma.note.create({
      data: {
        ...generateMockNote(),
      },
    })
    const comment = await proxy.service.createComment(note.id, mockCommentData)
    const replyComment = await proxy.service.createThreadComment(
      comment.id,
      {
        ...mockCommentData,
        mail: 'test@cc1.com',
      },
      'guest',
    )

    spy.mockReset()

    const replyComment2 = await proxy.service.createThreadComment(
      replyComment.id,
      mockCommentData,
      'guest',
    )

    expect(replyComment2.mentions.includes(replyComment.id)).toBeTruthy()
    expect(replyComment2.parentId).toBe(comment.id)
    expect(spy.mock.calls[1]).toEqual([expect.anything(), 'owner'])
    expect(spy.mock.calls[0]).toEqual([
      expect.anything(),
      'guest',
      'test@cc1.com',
    ])
  })

  test('create more reply comment', async () => {
    const note = await prisma.note.create({
      data: {
        ...generateMockNote(),
      },
    })

    const comment = await proxy.service.createComment(note.id, mockCommentData)
    for (let i = 0; i < 10; i++) {
      await proxy.service.createThreadComment(
        comment.id,
        mockCommentData,
        'guest',
      )
    }

    const reComment = await proxy.service.getCommentById(comment.id)

    expect(reComment?.children.length).toBe(10)
  })
})
