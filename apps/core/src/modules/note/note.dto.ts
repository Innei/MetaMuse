import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { ArticleImagesSchema } from '@core/shared/dto/image.dto'
import { basePagerSchema } from '@core/shared/dto/pager.dto'
import { NoteOptionalDefaultsSchema, NoteSchema } from '@meta-muse/prisma/zod'

import { NoteSchemaProjection } from './note.protect'

export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})
export const NoteInputSchema = NoteOptionalDefaultsSchema.extend({
  title: z.string().transform((val) => {
    if (val.trim().length === 0) {
      return 'Untitled'
    }
    return val
  }),
  custom_created: z.coerce.date().optional(),
  meta: z.any().optional(),
  images: ArticleImagesSchema.default([]).optional(),
  coordinates: CoordinatesSchema.optional().nullable(),
  publicAt: z.coerce.date().optional().nullable(),
}).omit(NoteSchemaProjection)

export class NoteDto extends createZodDto(NoteInputSchema) {}

export class NotePagerDto extends createZodDto(
  basePagerSchema.extend({
    sortBy: z.enum(['created', 'modified']).optional(),
    select: z.array(NoteSchema.keyof()).optional(),
    exclude: z.array(NoteSchema.keyof()).optional(),
  }),
) {}

export class NotePatchDto extends createZodDto(NoteInputSchema.partial()) {}
