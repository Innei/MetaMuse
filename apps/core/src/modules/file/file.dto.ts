import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

import { FileTypeEnum } from './file.type'

export const FileQuerySchema = z.object({
  type: z.nativeEnum(FileTypeEnum),
  name: z.string(),
})

export class FileQueryDto extends createZodDto(FileQuerySchema) {}

export const FileUploadSchema = z.object({
  type: z.nativeEnum(FileTypeEnum).optional(),
})

export class FileUploadDto extends createZodDto(FileUploadSchema) {}
