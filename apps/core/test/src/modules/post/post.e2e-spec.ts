import snakecaseKeys from 'snakecase-keys'

import { PostModule } from '@core/modules/post/post.module'
import { snowflake } from '@core/processors/database/snowflake.util'
import { createE2EApp } from '@test/helper/create-e2e-app'
import { createMockGlobalModule } from '@test/helper/create-mock-global-module'
import { reDeserializeData } from '@test/helper/serialize-data'
import { prisma } from '@test/lib/prisma'
import { generateMockCategory } from '@test/mock/data/category.data'
import { generateMockPost } from '@test/mock/data/post.data'
import { mockedImageServiceProvider } from '@test/mock/helper/helper.image'

describe('ROUTE /posts', () => {
  const proxy = createE2EApp({
    imports: [PostModule, createMockGlobalModule([mockedImageServiceProvider])],
  })

  const createMockCategory = async () => {
    return await prisma.category.create({
      data: {
        ...generateMockCategory(),
        slug: `test${snowflake.nextId()}`,
      },
    })
  }
  beforeEach(async () => void (await prisma.post.deleteMany()))

  it('GET /posts when nothing', async () => {
    const res = await proxy.app.inject('/posts')
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchInlineSnapshot(`
      {
        "data": [],
        "pagination": {
          "current_page": 0,
          "has_next_page": false,
          "has_prev_page": false,
          "size": 10,
          "total": 0,
          "total_page": 0,
        },
      }
    `)
  })

  test('GET /posts when has data and un published', async () => {
    const cate = await createMockCategory()

    for (let i = 0; i < 5; i++) {
      const post = generateMockPost()
      await prisma.post.create({
        data: {
          ...post,
          categoryId: cate.id,
          pin: false,
          isPublished: i % 2 === 0,
        },
      })
    }

    const res = await proxy.app.inject({
      method: 'GET',
      url: '/posts',
    })

    expect(res.statusCode).toBe(200)
    const data = res.json()
    expect(data.data.length).toBe(3)
  })

  test('GET /posts/:id should work', async () => {
    const cate = await createMockCategory()

    const post = generateMockPost()
    const postData = await prisma.post.create({
      data: {
        ...post,
        categoryId: cate.id,
        pin: false,
      },
    })

    const res = await proxy.app.inject({
      method: 'GET',
      url: `/posts/${postData.id}`,
    })

    expect(res.statusCode).toBe(200)
    const data = res.json()
    expect(data).toMatchObject(
      snakecaseKeys({
        ...reDeserializeData(postData),
        category: reDeserializeData(cate),
      }),
    )
  })

  test('GET /posts/:id should 404 when un published', async () => {
    const cate = await createMockCategory()

    const post = generateMockPost()
    const postData = await prisma.post.create({
      data: {
        ...post,
        categoryId: cate.id,
        pin: false,
        isPublished: false,
      },
    })

    const res = await proxy.app.inject({
      method: 'GET',
      url: `/posts/${postData.id}`,
    })

    expect(res.statusCode).toBe(404)
  })

  test('GET /posts/:category/:slug should 404 when un published', async () => {
    const cate = await createMockCategory()

    const post = generateMockPost()
    const postData = await prisma.post.create({
      data: {
        ...post,
        categoryId: cate.id,
        pin: false,
        isPublished: false,
      },
    })

    const res = await proxy.app.inject({
      method: 'GET',
      url: `/posts/${cate.slug}/${postData.slug}`,
    })

    expect(res.statusCode).toBe(404)
  })

  test('GET /posts/:category/:slug should work', async () => {
    const cate = await createMockCategory()

    const post = generateMockPost()
    const postData = await prisma.post.create({
      data: {
        ...post,
        categoryId: cate.id,
        pin: false,
      },
    })

    const res = await proxy.app.inject({
      method: 'GET',
      url: `/posts/${cate.slug}/${postData.slug}`,
    })

    expect(res.statusCode).toBe(200)
    const data = res.json()
    expect(data).toMatchObject(
      snakecaseKeys({
        ...reDeserializeData(postData),
        category: reDeserializeData(cate),
      }),
    )
  })
})
