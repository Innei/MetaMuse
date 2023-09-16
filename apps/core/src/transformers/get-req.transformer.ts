import { FastifyRequest } from 'fastify'

import { User } from '@meta-muse/prisma'
import { ExecutionContext } from '@nestjs/common'

export function getNestExecutionContextRequest(
  context: ExecutionContext,
): FastifyRequest & { owner?: User } & Record<string, any> {
  return context.switchToHttp().getRequest<FastifyRequest>()
}
