import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { TRPCRouterBase } from '@core/processors/trpc/trpc.class'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { Inject, Injectable } from '@nestjs/common'

import { CategoryService } from './category.service'

@Injectable()
@TRPCRouter()
export class CategoryTRPCRouter extends TRPCRouterBase {
  protected router: ReturnType<typeof this.createRouter>

  @Inject()
  trpcService: tRPCService

  @Inject()
  service: CategoryService

  createRouter() {
    const t = this.trpcService.procedureAuth
    return defineTrpcRouter('category', {
      getSlugById: t
        .input(SnowflakeIdDto.schema)
        .output(z.string())
        .query(async ({ input: { id } }) => {
          const result = await this.service.findById(id)
          if (!result) {
            throw new BizException(ErrorCodeEnum.CategoryNotFound)
          }
          return result.slug
        }),
    })
  }
}
