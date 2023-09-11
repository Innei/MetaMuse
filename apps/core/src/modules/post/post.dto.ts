import { createZodDto } from 'nestjs-zod/dto'
import slugify from 'slugify'
import { z } from 'zod'

import { basePagerSchema } from '@core/shared/dto/pager.dto'
import { PostOptionalDefaultsSchema, PostSchema } from '@prisma/client/zod'

import { PostSchemaProjection } from './post.protect'

export class PostDto extends createZodDto(
  PostOptionalDefaultsSchema.extend({
    related: z.array(z.string()).optional(),
    slug: z
      .string()
      .transform((val) => slugify(val, { lower: true, trim: true })),
  }).omit(PostSchemaProjection),
) {}

export class PostPagerDto extends createZodDto(
  basePagerSchema.extend({
    sortBy: z.enum(['created', 'modified']).optional(),
    select: z.array(PostSchema.keyof().or(z.enum(['category']))).optional(),
  }),
) {}

export class CategoryAndSlugDto extends createZodDto(
  z.object({
    category: z.string(),
    slug: z.string(),
  }),
) {}
