import { getNestExecutionContextRequest } from '@core/transformers/get-req.transformer'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { AuthGuard } from './auth.guard'

/**
 * 区分游客和主人的守卫
 */

@Injectable()
export class RolesGuard extends AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context)
    let isMaster = false
    try {
      await super.canActivate(context)
      isMaster = true
      // eslint-disable-next-line no-empty
    } catch {}

    request.isGuest = !isMaster
    request.isMaster = isMaster

    return true
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context)
  }
}
