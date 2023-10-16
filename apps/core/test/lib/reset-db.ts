import { Prisma } from '@prisma/client'

import { prisma } from './prisma'

// eslint-disable-next-line import/no-default-export
export default async () => {
  await prisma.$transaction(async (c) => {
    const tasks = [] as Promise<any>[]

    const allNames = [] as string[]
    Prisma.dmmf.datamodel.models.forEach((model) => {
      allNames.push(model.name[0].toLowerCase() + model.name.slice(1))
    })
    for (const key of allNames) {
      if (key.startsWith('$')) continue
      if (key === 'category') continue
      tasks.push(c[key].deleteMany())
    }
    await Promise.all(tasks)

    await c.category.deleteMany()
  })
}
