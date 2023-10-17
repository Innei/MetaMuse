import { FastifyRequest } from 'fastify'

import { ExecutionContext } from '@nestjs/common'

export function getNestExecutionContextRequest(
  context: ExecutionContext,
): FastifyRequest & { owner?: Owner; token?: string } & Record<string, any> {
  return context.switchToHttp().getRequest<FastifyRequest>()
}
