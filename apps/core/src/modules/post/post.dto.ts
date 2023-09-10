import { createZodDto } from 'nestjs-zod/dto'
import { z } from 'zod'

import { PostOptionalDefaultsSchema } from '@prisma/client/zod'

import { PostSchemaProjection } from './post.protect'

export class PostDto extends createZodDto(
  PostOptionalDefaultsSchema.extend({
    related: z.array(z.string()).optional(),
  }).omit(PostSchemaProjection),
) {}
