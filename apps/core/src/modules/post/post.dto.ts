import { createZodDto } from 'nestjs-zod/dto'
import { z } from 'zod'

import { basePagerSchema } from '@core/shared/dto/pager.dto'
import { PostOptionalDefaultsSchema } from '@prisma/client/zod'

import { PostSchemaProjection } from './post.protect'

export class PostDto extends createZodDto(
  PostOptionalDefaultsSchema.extend({
    related: z.array(z.string()).optional(),
  }).omit(PostSchemaProjection),
) {}

export class PostPagerDto extends createZodDto(
  basePagerSchema.extend({
    sortBy: z.enum(['created', 'modified']).optional(),
  }),
) {}
