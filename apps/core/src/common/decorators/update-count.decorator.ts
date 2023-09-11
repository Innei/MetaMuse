import { ArticleType } from '@core/constants/article.constant'
import { HTTP_RES_UPDATE_DOC_COUNT_TYPE } from '@core/constants/meta.constant'
import { SetMetadata } from '@nestjs/common'

export const VisitDocument: (
  type: keyof typeof ArticleType,
) => MethodDecorator = (type) => {
  return (_, __, descriptor: any) => {
    SetMetadata(HTTP_RES_UPDATE_DOC_COUNT_TYPE, type)(descriptor.value)
  }
}
