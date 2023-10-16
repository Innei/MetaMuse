import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { CommentSchema } from '@meta-muse/prisma/zod'
import { Comment } from '@prisma/client'
import { Pick } from '@prisma/client/client/runtime/library'

import { CommentRefTypes } from './comment.enum'

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

export interface CreateCommentWithAgentDto
  extends z.infer<typeof CreateCommentInputSchema>,
    Pick<Comment, 'agent' | 'ip'> {}

export class CommentRefTypesDto extends createZodDto(
  z.object({
    ref: z.nativeEnum(CommentRefTypes),
  }),
) {}
