import { createZodDto } from 'nestjs-zod/dto'
import slugify from 'slugify'
import { z } from 'zod'

import { ArticleImagesSchema } from '@core/shared/dto/image.dto'
import { basePagerSchema } from '@core/shared/dto/pager.dto'
import { makeAllPropsOptional } from '@core/shared/utils/zod.util'
import { PostOptionalDefaultsSchema, PostSchema } from '@meta-muse/prisma/zod'

import { PostSchemaProjection } from './post.protect'

export const PostInputSchema = PostOptionalDefaultsSchema.extend({
  title: z.string().transform((val) => {
    if (val.trim().length === 0) {
      return 'Untitled'
    }
    return val
  }),
  slug: z
    .string()
    .min(1)
    .transform((val) => slugify(val, { lower: true, trim: true })),
  tagIds: z.array(z.string()).optional(),
  relatedIds: z.array(z.string()).optional(),
  custom_created: z.coerce.date().optional(),
  meta: z.any().optional(),
  images: ArticleImagesSchema.default([]).optional(),
  summary: z.string().optional().nullable(),
}).omit(PostSchemaProjection)

export class PostDto extends createZodDto(PostInputSchema) {}

export class PostPatchDto extends createZodDto(
  makeAllPropsOptional(PostInputSchema),
) {}

export class PostPagerDto extends createZodDto(
  basePagerSchema.extend({
    sortBy: z.enum(['created', 'modified']).optional(),
    select: z.array(PostSchema.keyof().or(z.enum(['category']))).optional(),
    exclude: z.array(PostSchema.keyof()).optional(),
  }),
) {}

export class CategoryAndSlugDto extends createZodDto(
  z.object({
    category: z.string(),
    slug: z.string(),
  }),
) {}
