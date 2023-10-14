import { z } from 'zod'

import { BizException } from '@core/common/exceptions/biz.exception'
import { errorMessageFor } from '@core/i18n/biz-code'
import { inferRouterInputs, inferRouterOutputs, initTRPC } from '@trpc/server'

import { Context } from './trpc.context'
import { tRPCService } from './trpc.service'

export const tRpc = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error, ctx } = opts
    let bizMessage = ''

    if (error.cause instanceof BizException) {
      const acceptLanguage = ctx?.lang
      const languages = acceptLanguage.split(',')
      const preferredLanguage = languages[0]?.split(';')?.[0]
      const BizError = error.cause

      bizMessage =
        errorMessageFor(BizError.code, preferredLanguage) || BizError.message
    }

    if (error.cause instanceof z.ZodError) {
      bizMessage = Array.from(
        Object.keys(error.cause.flatten().fieldErrors),
      )[0][0]
    }

    return {
      ...shape,
      message: bizMessage || shape.message,
      data: {
        ...shape.data,
      },
    }
  },
})
export type tRpcRouterType = (typeof tRpc)['router']
export type tRpcProcedure = (typeof tRpc)['procedure']
export type tRpc$Config = typeof tRpc._config

export type AppRouter = tRPCService['appRouter']
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
