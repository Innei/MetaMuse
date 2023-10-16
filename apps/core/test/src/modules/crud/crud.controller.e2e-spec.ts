// test with note topic

import { TopicInputSchema } from '@core/modules/topic/topic.dto'
import { BaseCrudFactory } from '@core/transformers/curd-factor.transformer'
import { Module } from '@nestjs/common'
import { createE2EApp } from '@test/helper/create-e2e-app'
import { prisma } from '@test/lib/prisma'

const TopicController = BaseCrudFactory({
  modelName: 'noteTopic',
  apiPrefix: 'topics',
  createSchema: TopicInputSchema,
  eventPrefix: 'TOPIC',
})

@Module({
  controllers: [TopicController],
})
class CrudModule {}

describe('TopicController', () => {
  const proxy = createE2EApp({
    imports: [CrudModule],
  })

  it('GET /topics', async () => {
    const res = await proxy.app.inject('/topics')
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchInlineSnapshot(`
{
  "data": [],
  "pagination": {
    "current_page": 1,
    "has_next_page": false,
    "has_prev_page": false,
    "size": 10,
    "total": 0,
    "total_page": 0,
  },
}
`)
  })

  it('data validation should work', async () => {
    const res1 = await proxy.app.inject('/topics?page=-10')
    expect(res1.statusCode).toBe(422)
    const res2 = await proxy.app.inject({
      url: '/topics',
      method: 'POST',
      body: {
        name2: '123',
      },
    })
    expect(res2.statusCode).toBe(422)
  })

  it('POST /topics', async () => {
    const res = await proxy.app.inject({
      url: '/topics',
      method: 'POST',
      body: {
        name: '123',
        slug: '123',
        icon: null,
      },
    })
    expect(res.statusCode).toBe(201)
    const result = res.json()
    delete result.created
    delete result.id
    expect(result).toMatchInlineSnapshot(`
      {
        "description": "",
        "icon": null,
        "introduce": "",
        "name": "123",
        "slug": "123",
      }
    `)
  })

  it('PUT /topics/:id', async () => {
    const res = await proxy.app.inject({
      url: '/topics',
      method: 'POST',
      body: {
        name: '122223',
        slug: '12223',
        icon: null,
      },
    })
    expect(res.statusCode).toBe(201)
    const result = res.json()
    const updated = await proxy.app.inject({
      url: `/topics/${result.id}`,
      method: 'PUT',
      body: {
        name: '12223',
        slug: '122223',
        icon: null,
      },
    })

    expect(updated.statusCode).toBe(200)
    expect(updated.json().name).toBe('12223')
  })

  it('Delete /topics/:id', async () => {
    const res = await proxy.app.inject({
      url: '/topics',
      method: 'POST',
      body: {
        name: '122223',
        slug: '12223',
        icon: null,
      },
    })
    expect(res.statusCode).toBe(201)
    const result = res.json()
    await proxy.app.inject({
      url: `/topics/${result.id}`,
      method: 'delete',
    })

    const r = await prisma.noteTopic.findUnique({ where: { id: result.id } })
    expect(r).toBeNull()
  })
})
