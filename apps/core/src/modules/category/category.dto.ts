import { createZodDto } from 'nestjs-zod/dto'

import { CategorySchema } from '@meta-muse/prisma/zod'

import { categorySchemaProjection } from './category.project'

export class CategoryDto extends createZodDto(
  CategorySchema.omit(categorySchemaProjection),
) {}
