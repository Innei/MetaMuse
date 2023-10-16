import { prisma } from '@test/lib/prisma'

import { generateMockNote } from '../mock/data/note.data'

async function main() {
  for (let i = 0; i < 100; i++) {
    await prisma.note.create({
      data: { ...generateMockNote() },
    })
  }
}

main()
