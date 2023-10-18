import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { basePagerSchema } from '@core/shared/dto/pager.dto'
import { Comment, CommentState } from '@meta-muse/prisma'
import { Pick } from '@meta-muse/prisma/client/runtime/library'
import { CommentSchema } from '@meta-muse/prisma/zod'

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

export const CommentPagerSchema = basePagerSchema.extend({
  state: z
    .nativeEnum(CommentState)
    .or(z.enum(['1', '2', '3']))
    .optional()
    .transform((val) => {
      if (!val) return CommentState.READ
      const isNumber = !isNaN(val as any)

      if (isNumber) {
        return {
          1: CommentState.UNREAD,
          2: CommentState.READ,
          3: CommentState.SPAM,
        }[val] as CommentState
      }
      return val as CommentState
    }),
})

export class CommentPagerDto extends createZodDto(CommentPagerSchema) {}

export const CommentOnlyTextSchema = z.object({
  text: z.string().max(1024),
})

export class CommentOnlyTextDto extends createZodDto(CommentOnlyTextSchema) {}
