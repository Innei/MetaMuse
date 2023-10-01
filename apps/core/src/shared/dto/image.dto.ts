import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ArticleImageSchema = z.object({
  src: z.string(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  accent: z.string().optional().nullable(),
  type: z.string(),
})

export const ArticleImagesSchema = z.array(ArticleImageSchema)

export class ArticleImagesDto extends createZodDto(ArticleImagesSchema) {}

export type ArticleImage = z.infer<typeof ArticleImageSchema>
