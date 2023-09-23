import { isTest } from '@core/global/env.global'
import { AuthService } from '@core/modules/auth/auth.service'
import { UserService } from '@core/modules/user/user.service'
import { getNestExecutionContextRequest } from '@core/transformers/get-req.transformer'
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { BizException } from '../exceptions/biz.exception'

/**
 * JWT auth guard
 */

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(AuthService)
  private authService: AuthService

  @Inject(UserService)
  private userService: UserService

  async canActivate(context: ExecutionContext): Promise<any> {
    if (isTest) {
      return true
    }
    const request = this.getRequest(context)

    const query = request.query as any
    const headers = request.headers
    const Authorization: string =
      headers.authorization || headers.Authorization || query.token

    if (!Authorization) {
      throw new UnauthorizedException('未登录')
    }

    const result = await this.authService.validate(Authorization)

    if (result !== true) {
      throw new BizException(result)
    }

    const owner = await this.userService.getOwner()
    request.owner = owner
    request.token = Authorization.split(' ')[1]

    return true
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context)
  }
}
