import { z } from 'zod'

import { TRPCRouter } from '@core/common/decorators/trpc.decorator'
import { DatabaseService } from '@core/processors/database/database.service'
import { HttpService } from '@core/processors/helper/services/helper.http.service'
import { defineTrpcRouter } from '@core/processors/trpc/trpc.helper'
import { tRPCService } from '@core/processors/trpc/trpc.service'
import { SnowflakeIdDto, SnowflakeIdSchema } from '@core/shared/dto/id.dto'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

import { NoteInputSchema, NotePagerDto } from './note.dto'
import { NoteService } from './note.service'
import { AMapSearch } from './types/amap'

@TRPCRouter()
@Injectable()
export class NoteTrpcRouter implements OnModuleInit {
  private router: ReturnType<typeof this.createRouter>

  @Inject(tRPCService)
  private trpcService: tRPCService

  @Inject(DatabaseService)
  private databaseService: DatabaseService

  @Inject(NoteService)
  private service: NoteService

  @Inject(HttpService)
  private httpService: HttpService

  onModuleInit() {
    this.router = this.createRouter()
  }

  private createRouter() {
    const procedureAuth = this.trpcService.procedureAuth

    return defineTrpcRouter('note', {
      paginate: procedureAuth
        .input(NotePagerDto.schema)
        .query(async ({ input: query }) => {
          const result = await this.service.paginateNotes({
            ...query,
            exclude: ['password', ...(query.exclude ?? [])],
          })

          const resultWithSummary = result.data.map((item) => {
            if (!item?.text) return item
            return {
              ...item,
              text:
                item.text.length > 100
                  ? `${item.text.slice(0, 100)}...`
                  : item.text,
            }
          })
          return {
            ...result,
            data: resultWithSummary,
          }
        }),

      getLatestId: procedureAuth.query(async () => {
        return this.service.getLatestNoteId()
      }),
      id: procedureAuth
        .input(SnowflakeIdDto.schema)
        .query(
          async ({ input: query }) => await this.service.getNoteById(query.id),
        ),
      update: procedureAuth
        .input(
          NoteInputSchema.extend({
            id: z.string(),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          const { id, ...data } = input

          await this.service.updateById(id, data)
        }),

      create: procedureAuth.input(NoteInputSchema).mutation(async (opt) => {
        const { input } = opt

        return await this.service.create(input)
      }),
      delete: procedureAuth
        .input(SnowflakeIdDto.schema)
        .mutation(async (opt) => {
          const { input } = opt

          await this.service.deleteById(input.id)
        }),

      batchDelete: procedureAuth
        .input(
          z.object({
            ids: z.array(SnowflakeIdSchema),
          }),
        )
        .mutation(async (opt) => {
          const { input } = opt

          await Promise.all(input.ids.map((id) => this.service.deleteById(id)))
        }),

      amapSearch: procedureAuth
        .input(
          z.object({
            token: z.string(),
            keywords: z.string(),
          }),
        )
        .query(async ({ input }) => {
          const { keywords, token } = input

          const params = new URLSearchParams([
            ['key', token],
            ['keywords', keywords],
          ])

          return this.httpService.queryClient.fetchQuery({
            queryKey: ['amapSearch', params.get('keywords')],
            queryFn: async ({ signal }) => {
              const response = await this.httpService.axiosRef
                .get(
                  `https://restapi.amap.com/v3/place/text?${params.toString()}`,
                  {
                    signal,
                  },
                )
                .catch(() => null)
              return response?.data as AMapSearch
            },
          })
        }),
    })
  }
}
