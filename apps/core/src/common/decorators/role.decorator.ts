import { getNestExecutionContextRequest } from '@core/transformers/get-req.transformer'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const IsGuest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getNestExecutionContextRequest(ctx)
    return request.isGuest
  },
)

export const IsOwner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = getNestExecutionContextRequest(ctx)
    return request.isMaster
  },
)
