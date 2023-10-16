import { pick } from 'lodash'

import { ArticleService } from '@core/modules/article/article.service'
import { CommentService } from '@core/modules/comment/comment.service'
import { UserService } from '@core/modules/user/user.service'
import { sleep } from '@core/shared/utils/tool.utils'
import { createMockGlobalModule } from '@test/helper/create-mock-global-module'
import { createServiceUnitTestApp } from '@test/helper/create-service-unit'
import { prisma } from '@test/lib/prisma'
import resetDb from '@test/lib/reset-db'
import { generateMockNote } from '@test/mock/data/note.data'
import { mockedEmailServiceProvider } from '@test/mock/helper/helper.email'
import { mockedEventManagerService } from '@test/mock/helper/helper.event'

describe('/modules/post/post.service', () => {
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
  })

  it('create comment', async () => {
    const note = await prisma.note.create({
      data: {
        ...generateMockNote(),
      },
    })
    const comment = await proxy.service.createComment(note.id, {
      url: null,
      author: 'test',
      avatar: null,
      isWhispers: false,
      mail: 'i@innei.in',
      source: null,
      text: 'test',
      ip: '1.1.1.1',
      agent: 'chrome',
    })

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
  })
})
