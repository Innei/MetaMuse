import { createZodDto } from 'nestjs-zod/dto'
import slugify from 'slugify'
import { z } from 'zod'

import { ArticleImagesSchema } from '@core/shared/dto/image.dto'
import { PageOptionalDefaultsSchema } from '@meta-muse/prisma/zod'

import { PageSchemaProjection } from './page.protect'

export const PageInputSchema = PageOptionalDefaultsSchema.extend({
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

  custom_created: z.coerce.date().optional(),
  meta: z.any().optional(),
  images: ArticleImagesSchema.default([]).optional(),
}).omit(PageSchemaProjection)

export class PageDto extends createZodDto(PageInputSchema) {}

export class PagePatchDto extends createZodDto(PageInputSchema.partial()) {}
