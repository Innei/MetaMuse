import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { EventScope } from '@core/constants/event-scope.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { EventManagerService } from '@core/processors/helper/services/helper.event.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto, SnowflakeIdSchema } from '@core/shared/dto/id.dto'
import { PagerDto } from '@core/shared/dto/pager.dto'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { TopicInputSchema } from './topic.dto'
import { TopicService } from './topic.service'

const trpcPrefix = 'topic'
const dbModel = DatabaseService.client.noteTopic

const createSchema = TopicInputSchema
const patchSchema = createSchema.partial()

@TRPCRouter()
@Injectable()
export class TopicTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  @Inject()
  private readonly eventManager: EventManagerService

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject()
  private service: TopicService

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter(trpcPrefix, {
      notesByTopicId: procedureAuth
        .input(
          z.object({
            topicId: z.string(),
          }),
        )
        .query(async ({ input }) => {
          return this.service.getNotesByTopicId(input.topicId)
        }),

      addNotesToTopic: procedureAuth
        .input(
          z.object({
            topicId: SnowflakeIdSchema,
            noteIds: z.array(SnowflakeIdSchema),
          }),
        )
        .mutation(async ({ input }) => {
          const { topicId, noteIds } = input

          return this.service.addNotesToTopic(topicId, noteIds)
        }),

      removeNotesFromTopic: procedureAuth
        .input(
          z.object({
            topicId: SnowflakeIdSchema,
            noteIds: z.array(SnowflakeIdSchema),
          }),
        )
        .mutation(async ({ input }) => {
          const { topicId, noteIds } = input

          return this.service.removeNotesFromTopic(topicId, noteIds)
        }),

      /// base
      id: procedureAuth.input(SnowflakeIdDto.schema).query(async (opt) => {
        return dbModel
          .findUniqueOrThrow({
            where: { id: opt.input.id },
          })
          .then((data) => {
            return {
              ...data,
            }
          })
      }),

      all: procedureAuth.query(async () => {
        return dbModel.findMany()
      }),
      paginate: procedureAuth.input(PagerDto.schema).query(
        async ({ input: query }) =>
          await dbModel.paginate(
            {
              where: {},
              orderBy: {
                created: 'desc',
              },
            },
            {
              size: query.size || 10,
              page: query.size || 1,
            },
          ),
      ),

      update: procedureAuth
        .input(
          patchSchema.extend({
            id: z.string(),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          const { id, ...data } = input

          await dbModel.update({
            where: {
              id,
            },
            data,
          })
          const newData = await dbModel.findUnique({
            where: {
              id,
            },
          })
          newData &&
            this.eventManager.emit(`${trpcPrefix}_UPDATE` as any, newData, {
              scope: EventScope.ALL,
            })
        }),

      create: procedureAuth.input(createSchema).mutation(async (opt) => {
        const { input } = opt

        const result = await dbModel.create({ data: input })

        this.eventManager.emit(`${trpcPrefix}_CREATE` as any, result, {
          scope: EventScope.ALL,
        })
        return result
      }),
      delete: procedureAuth
        .input(SnowflakeIdDto.schema)
        .mutation(async (opt) => {
          const { input } = opt

          await dbModel.delete({
            where: {
              id: input.id,
            },
          })
          this.eventManager.emit(
            `${trpcPrefix}_DELETE` as any,
            { id: input.id },
            {
              scope: EventScope.ALL,
            },
          )
        }),

      batchDelete: procedureAuth
        .input(
          z.object({
            ids: z.array(SnowflakeIdSchema),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          await dbModel.deleteMany({
            where: {
              id: {
                in: input.ids,
              },
            },
          })

          for (const id of input.ids) {
            this.eventManager.emit(
              `${trpcPrefix}_DELETE` as any,
              { id },
              {
                scope: EventScope.ALL,
              },
            )
          }
        }),
    })
  }
}
