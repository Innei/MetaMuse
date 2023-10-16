import { Prisma } from '@prisma/client'

export const CommentInclude: Prisma.CommentInclude = {
  children: true,
}
