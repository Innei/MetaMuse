import { createZodDto } from 'nestjs-zod'
import { z, ZodSchema } from 'zod'

import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { Auth } from '@core/common/decorators/auth.decorator'
import { HTTPDecorators } from '@core/common/decorators/http.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import {
  AllModelNames,
  ModelInputWhere,
} from '@core/processors/database/prisma.instance'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { SnowflakeIdDto } from '@core/shared/dto/id.dto'
import { basePagerSchema } from '@core/shared/dto/pager.dto'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { toOrder } from '@core/utils/data.util'
import {
  Body,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Type,
} from '@nestjs/common'

class PagerDto extends createZodDto(
  basePagerSchema.extend({
    state: z.number().int().optional(),
    select: z.array(z.string()).optional(),
  }),
) {}

type ClassType<T> = new (...args: any[]) => T
export function BaseCrudFactory<
  T extends AllModelNames,
  CDto extends z.AnyZodObject = z.AnyZodObject,
  PDto extends z.AnyZodObject = z.AnyZodObject,
>({
  modelName,
  classUpper,
  apiPrefix,
  eventPrefix,

  createSchema,
  patchSchema,
}: {
  modelName: T
  apiPrefix: string
  classUpper?: ClassType<any>
  createSchema: CDto
  patchSchema?: PDto
  eventPrefix: string
}): Type<any> {
  const Upper = classUpper || class {}

  class PatchDto extends createZodDto(
    patchSchema || (createSchema.partial() as ZodSchema<any, any>),
  ) {}

  class CreateDto extends createZodDto(createSchema) {}

  @ApiController(apiPrefix)
  class BaseCrud extends Upper {
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService

    @Inject()
    private readonly eventManager: EventManagerService

    private get db() {
      return this.databaseService.prisma[
        modelName
      ] as any as typeof this.databaseService.prisma.user
    }
    @Get('/:id')
    async get(@Param() param: SnowflakeIdDto) {
      const { id } = param
      return await this.db
        .findUniqueOrThrow({
          where: {
            id,
          } satisfies ModelInputWhere<T>,
        })
        .catch(
          resourceNotFoundWrapper(
            new BizException(ErrorCodeEnum.ResourceNotFound),
          ),
        )
    }

    @Get('/')
    async gets(@Query() pager: PagerDto) {
      // TODO filter query
      // https://github.com/chax-at/prisma-filter
      const {
        size = 10,
        page = 1,
        select,

        sortBy = 'created',
        sortOrder = -1,
      } = pager
      return this.db.paginate(
        {
          select:
            (select?.reduce((acc, s) => ({ ...acc, [s]: true }), {}) as any) ??
            null,
          orderBy: {
            [sortBy]: toOrder(sortOrder),
          },
        },
        {
          size,
          page,
        },
      )
    }

    @Get('/all')
    async getAll() {
      return await this.db.findMany()
    }

    @Post('/')
    @HTTPDecorators.Idempotence()
    @Auth()
    async create(@Body() body: CreateDto) {
      // @ts-expect-error
      return await this.db.create({ data: body }).then((res) => {
        this.eventManager.broadcast(`${eventPrefix}_CREATE` as any, res, {
          scope: EventScope.TO_SYSTEM_VISITOR,
        })
        return res
      })
    }

    @Put('/:id')
    @HTTPDecorators.Idempotence()
    @Auth()
    async update(@Body() body: CreateDto, @Param() { id }: SnowflakeIdDto) {
      return await this.db
        // TODO update modified
        .update({ where: { id }, data: { ...body } })
        .then((res) => {
          this.eventManager.broadcast(`${eventPrefix}_UPDATE` as any, res, {
            scope: EventScope.TO_SYSTEM_VISITOR,
          })
          return res
        })
    }

    @Patch('/:id')
    @HTTPDecorators.Idempotence()
    @Auth()
    async patch(@Body() body: PatchDto, @Param() { id }: SnowflakeIdDto) {
      await this.db
        // TODO update modified
        .update({ where: { id }, data: { ...body } })
        .then((res) => {
          this.eventManager.broadcast(`${eventPrefix}_UPDATE` as any, res, {
            scope: EventScope.TO_SYSTEM_VISITOR,
          })
          return res
        })
    }

    @Delete('/:id')
    @Auth()
    @HttpCode(204)
    async delete(@Param() param: SnowflakeIdDto) {
      await this.db.delete({ where: { id: param.id } })

      await this.eventManager.broadcast(
        `${eventPrefix}_DELETE` as any,
        param.id,
        {
          scope: EventScope.TO_SYSTEM_VISITOR,
        },
      )

      return
    }
  }

  return BaseCrud
}
