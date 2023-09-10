import { createZodDto } from 'nestjs-zod/dto'
import { z } from 'zod'

import { PostSchema } from '@prisma/client/zod'

import { PostSchemaProjection } from './post.protect'

export class PostDto extends createZodDto(
  PostSchema.extend({
    related: z.array(z.string()).optional(),
  }).omit(PostSchemaProjection),
) {}
