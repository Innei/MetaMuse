import { createProjectionOmit } from '@core/shared/utils/schema.util'
import { Prisma } from '@prisma/client'
import { CommentSchema } from '@prisma/client/zod'

export const CommentInclude: Prisma.CommentInclude = {
  children: true,
}

export const CommentSchemaSerializeProjection = createProjectionOmit(
  CommentSchema.shape,
  ['ip'],
)
