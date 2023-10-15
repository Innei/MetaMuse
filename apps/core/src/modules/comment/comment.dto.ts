import { createZodDto } from 'nestjs-zod'

import { CommentSchema } from '@meta-muse/prisma/zod'

export const CreateCommentInputSchema = CommentSchema.pick({
  url: true,
  avatar: true,
  mail: true,
  name: true,
  text: true,
  author: true,
  source: true,
  isWhispers: true,
})

export class CreateCommentDto extends createZodDto(CreateCommentInputSchema) {}
