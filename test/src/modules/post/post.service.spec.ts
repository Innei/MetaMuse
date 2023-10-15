import { PostService } from '@core/modules/post/post.service'
import { sleep } from '@core/shared/utils/tool.utils'
import { Prisma } from '@prisma/client'
import { createServiceUnitTestApp } from '@test/helper/create-service-unit'
import { prisma } from '@test/lib/prisma'
import resetDb from '@test/lib/reset-db'
import { generateMockCategory } from '@test/mock/data/category.data'
import { generateMockPost, mockPostInputData } from '@test/mock/data/post.data'
import { mockedEventManagerService } from '@test/mock/helper/helper.event'
import { mockedImageServiceProvider } from '@test/mock/helper/helper.image'

describe('/modules/post/post.service', () => {
  const proxy = createServiceUnitTestApp(PostService, {
    providers: [mockedImageServiceProvider],
  })

  const createMockCategory = async () => {
    return await prisma.category.create({
      data: {
        ...generateMockCategory(),
      },
    })
  }

  beforeEach(async () => {
    await resetDb()
  })

  it('should create post successful', async () => {
    const category = await createMockCategory()
    const { id } = category

    const result = await proxy.service.create({
      ...mockPostInputData,
      categoryId: id,
      isPublished: true,
    })

    expect(result).toMatchObject({
      ...mockPostInputData,
      categoryId: id,
      category,
    })

    // 1 for TO_VISITOR 2 for TO_SYSTEM
    expect(mockedEventManagerService.emit).toBeCalledTimes(2)
  })

  it('should throw when post exist', async () => {
    const category = await createMockCategory()
    await prisma.post.create({
      data: {
        ...mockPostInputData,
        categoryId: category.id,
      },
    })
    const { id } = category
    await expect(
      proxy.service.create({
        ...mockPostInputData,
        categoryId: id,
      }),
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it('should throw when category not found', async () => {
    await expect(
      proxy.service.create({
        ...mockPostInputData,
        categoryId: 'not-found',
      }),
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it('should paginate posts successful', async () => {
    const cate = await createMockCategory()
    const mockedDataList = [] as Prisma.PostCreateManyInput[]
    for (let i = 0; i < 20; i++) {
      mockedDataList.push({
        ...generateMockPost(),
        categoryId: cate.id,
      })
    }

    await prisma.post.createMany({
      data: mockedDataList,
    })

    const pagination = await proxy.service.paginatePosts({
      page: 1,
      size: 5,
    })

    expect(pagination.pagination).toMatchInlineSnapshot(`
      {
        "currentPage": 0,
        "hasNextPage": true,
        "hasPrevPage": false,
        "size": 5,
        "total": 20,
        "totalPage": 0,
      }
    `)
    expect(pagination.data[0]!.category).toMatchObject(cate)
  })

  it('should get post by id successful', async () => {
    const cate = await createMockCategory()
    const post = await prisma.post.create({
      data: {
        ...generateMockPost(),
        categoryId: cate.id,
      },
    })

    const result = await proxy.service.getPostById(post.id)

    expect(result).toMatchObject(post)
  })

  it('should get post throw when 404', async () => {
    expect(
      proxy.service.getPostById('not-found'),
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it('create post should has count object', async () => {
    const cate = await createMockCategory()
    const post = await prisma.post.create({
      data: {
        ...generateMockPost(),
        categoryId: cate.id,
      },
    })

    expect(post.count).toMatchInlineSnapshot(`
      {
        "like": 0,
        "read": 0,
      }
    `)
  })

  it('should related other post', async () => {
    const cate = await createMockCategory()
    const basePost = await prisma.post.create({
      data: {
        ...generateMockPost(),
        categoryId: cate.id,
      },
    })

    const relatedIds = [basePost.id] as string[]

    const basePost2 = await prisma.post.create({
      data: {
        ...generateMockPost(),
        categoryId: cate.id,
      },
    })
    relatedIds.push(basePost2.id)

    const post = generateMockPost()
    const hasRelatedPost = await proxy.service.create({
      ...post,
      categoryId: cate.id,
      relatedIds,
    })

    expect(
      prisma.post.findUnique({
        where: {
          id: hasRelatedPost.id,
        },
        select: {
          related: {
            select: {
              id: true,
            },
          },
        },
      }),
    ).resolves.toMatchObject({
      related: relatedIds.map((id) => ({ id })),
    })

    /// test related each other
    //

    const basePostInDb = await prisma.post.findFirstOrThrow({
      where: { id: basePost.id },
      // include: { related: { select: { id: true } } },
      select: { related: { select: { id: true } } },
    })

    expect(basePostInDb).toMatchObject({
      related: [{ id: hasRelatedPost.id }],
    })

    const basePostInDb2 = await prisma.post.findFirstOrThrow({
      where: { id: basePost.id },
      // include: { related: { select: { id: true } } },
      select: { related: { select: { id: true } } },
    })

    expect(basePostInDb2).toMatchObject({
      related: [{ id: hasRelatedPost.id }],
    })
  })

  it('should toggle pin successful when creating', async () => {
    const cate = await createMockCategory()

    for (let i = 0; i < 5; i++) {
      const post = generateMockPost()
      await prisma.post.create({
        data: {
          ...post,
          categoryId: cate.id,
          pin: true,
        },
      })
    }
    const post = generateMockPost()

    const newPost = await proxy.service.create({
      ...post,
      categoryId: cate.id,
      pin: true,
    })

    expect(prisma.post.count({ where: { pin: true } })).resolves.toBe(1)
    expect(
      prisma.post.findMany({ where: { pin: true }, select: { id: true } }),
    ).resolves.toStrictEqual([
      {
        id: newPost.id,
      },
    ])
  })

  it('should pin work in pagination', async () => {
    const cate = await createMockCategory()

    for (let i = 0; i < 5; i++) {
      const post = generateMockPost()
      await prisma.post.create({
        data: {
          ...post,
          categoryId: cate.id,
          pin: false,
        },
      })
    }

    const post = generateMockPost()
    const newPost = await proxy.service.create({
      ...post,
      categoryId: cate.id,
      pin: true,
    })

    await sleep(20)
    await proxy.service.create({
      ...generateMockPost(),
      categoryId: cate.id,
      pin: false,
    })

    const pager = await proxy.service.paginatePosts({
      page: 0,
    })
    expect(pager.data[0]!.id).toBe(newPost.id)
  })

  it('pagination select field should work', async () => {
    const cate = await createMockCategory()

    for (let i = 0; i < 5; i++) {
      const post = generateMockPost()
      await prisma.post.create({
        data: {
          ...post,
          categoryId: cate.id,
          pin: false,
        },
      })
    }

    const pager = await proxy.service.paginatePosts({
      page: 0,
      select: ['id', 'category'],
    })

    expect(pager.data[0]).toMatchObject({
      id: expect.any(String),
      category: {
        ...cate,
      },
    })
  })

  it('should get latest post successful', async () => {
    const cate = await createMockCategory()

    for (let i = 0; i < 5; i++) {
      const post = generateMockPost()
      await prisma.post.create({
        data: {
          ...post,
          categoryId: cate.id,
          pin: false,
        },
      })
    }

    {
      const post = generateMockPost()
      await prisma.post.create({
        data: {
          ...post,
          categoryId: cate.id,
          pin: true,
        },
      })
    }
    const post = await prisma.post.create({
      data: {
        ...generateMockPost(),
        categoryId: cate.id,
      },
    })

    const result = await proxy.service.getLastPost()

    expect(result).toMatchObject(post)
  })

  it('should get post by slug and category successful', async () => {
    const cate = await createMockCategory()

    const post = await prisma.post.create({
      data: {
        ...generateMockPost(),
        categoryId: cate.id,
      },
    })

    const result = await proxy.service.getPostBySlug(post.slug, cate.slug)

    expect(result).toMatchObject(post)
  })

  it('should update post successful', async () => {
    const cate = await createMockCategory()
    const post = generateMockPost()
    const newPost = await prisma.post.create({
      data: {
        ...post,
        categoryId: cate.id,
      },
    })

    const result = await proxy.service.updateById(newPost.id, {
      text: 'new text',
    })

    expect(result)
  })

  it('should create post with tag successful', async () => {
    const cate = await createMockCategory()
    const tag = await prisma.postTag.create({
      data: {
        name: 'test tag',
      },
    })

    const result = await proxy.service.create({
      ...mockPostInputData,
      categoryId: cate.id,
      tagIds: [tag.id],
    })

    const result2 = await proxy.service.create({
      ...mockPostInputData,
      slug: 'test-slug2',
      categoryId: cate.id,
      tagIds: [tag.id],
    })

    expect(result.tags[0].id).toBe(tag.id)
    expect(result2.tags[0].id).toBe(tag.id)
  })

  it('should no deal tag when delete tags', async () => {
    const cate = await createMockCategory()
    const tag = await prisma.postTag.create({
      data: {
        name: 'test tag',
      },
    })

    const newPost = await proxy.service.create({
      ...mockPostInputData,
      categoryId: cate.id,
      tagIds: [tag.id],
    })

    await prisma.postTag.delete({
      where: {
        id: tag.id,
      },
    })

    const result = await proxy.service.getPostById(newPost.id)

    expect(result.tags.length).toBe(0)
  })

  it('should discard related if related post deleted', async () => {
    const cate = await createMockCategory()
    const post = generateMockPost()
    const relatedPost = await prisma.post.create({
      data: {
        ...post,
        categoryId: cate.id,
      },
    })

    const newPost = await proxy.service.create({
      ...post,
      slug: 'test-slug21',
      categoryId: cate.id,
      relatedIds: [relatedPost.id],
    })

    await prisma.post.delete({
      where: {
        id: relatedPost.id,
      },
    })

    const result = await proxy.service.getPostById(newPost.id)

    expect(result.related.length).toBe(0)
  })

  it('should custom created where create post', async () => {
    const cate = await createMockCategory()
    const post = generateMockPost()
    const customCreated = new Date('2021-01-01')

    const newPost = await proxy.service.create({
      ...post,
      slug: 'test-slug21',
      categoryId: cate.id,
      custom_created: customCreated,
    })

    expect(newPost.created.toISOString()).toBe(customCreated.toISOString())
  })

  it('should attach meta field when create post', async () => {
    const cate = await createMockCategory()
    const post = generateMockPost()
    const meta = {
      test: 'test',
    }

    const newPost = await proxy.service.create({
      ...post,
      slug: 'test-slug21',
      categoryId: cate.id,
      meta,
    })

    expect(newPost.meta).toMatchObject(meta)
  })

  it('should create post with images successful', async () => {
    const images = [
      {
        accent: '#333',
        height: 100,
        src: 'https://user-images.githubusercontent.com/12001979/120887724-5b0b6b00-c61a-11eb-8b9a-8b8b8b8b8b8b.png',
        type: '',
        width: 100,
      },
    ]

    const cate = await createMockCategory()
    const post = generateMockPost()
    const newPost = await proxy.service.create({
      ...post,
      slug: 'test-slug21',
      categoryId: cate.id,
      images,
    })

    expect(newPost.images).toMatchObject(images)
  })

  it('should update post with images successful', async () => {
    const images = [
      {
        accent: '#333',
        height: 100,
        src: 'https://user-images.githubusercontent.com/12001979/120887724-5b0b6b00-c61a-11eb-8b9a-8b8b8b8b8b8b.png',
        type: '',
        width: 100,
      },
    ]

    const cate = await createMockCategory()
    const post = generateMockPost()
    const newPost = await proxy.service.create({
      ...post,
      slug: 'test-slug21',
      categoryId: cate.id,
    })

    await proxy.service.updateById(newPost.id, {
      images,
    })

    const { images: dbImages } = await prisma.post.findUniqueOrThrow({
      where: {
        id: newPost.id,
      },
      select: {
        images: true,
      },
    })

    expect(dbImages).toMatchObject(images)
  })
})
