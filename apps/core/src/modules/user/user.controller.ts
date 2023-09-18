import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { Auth } from '@core/common/decorators/auth.decorator'
import {
  CurrentToken,
  Owner,
} from '@core/common/decorators/get-owner.decorator'
import { HTTPDecorators } from '@core/common/decorators/http.decorator'
import { IpLocation, IpRecord } from '@core/common/decorators/ip.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { User } from '@meta-muse/prisma'
import { Body, Get, HttpCode, Post, Put } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { AuthService } from '../auth/auth.service'
import { UserLoginDto } from './dtos/login.dto'
import { UserRegisterDto } from './dtos/register.dto'
import { UserSchemaSerializeProjection } from './user.protect'
import { UserService } from './user.service'

@ApiController(['master', 'user'])
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login')
  @Throttle({
    default: {
      limit: 5,
      ttl: 1_000,
    },
  })
  @HttpCode(200)
  @HTTPDecorators.ProtectKeys(UserSchemaSerializeProjection.keys)
  async login(@Body() body: UserLoginDto, @IpLocation() ipLocation: IpRecord) {
    const { username, password } = body
    const user = await this.authService.validateUsernameAndPassword(
      username,
      password,
    )
    const jwt = await this.authService.jwtServicePublic.sign(user.id, {
      ip: ipLocation.ip,
      ua: ipLocation.agent,
    })

    return {
      auth_token: jwt,
      ...user,
    }
  }

  @Put('/login')
  @Auth()
  async loginWithToken(
    @IpLocation() ipLocation: IpRecord,
    @Owner() user: User,
    @CurrentToken() token: string,
  ) {
    await this.userService.recordFootstep(ipLocation.ip)
    const singedToken = await this.authService.jwtServicePublic.sign(user.id, {
      ip: ipLocation.ip,
      ua: ipLocation.agent,
    })

    this.authService.jwtServicePublic.revokeToken(token, 6000)
    return {
      auth_token: singedToken,
    }
  }

  @Post('/register')
  @HTTPDecorators.ProtectKeys(UserSchemaSerializeProjection.keys)
  async register(@Body() body: UserRegisterDto) {
    const newUser = await this.userService.register(body)

    const token = await this.authService.jwtServicePublic.sign(newUser.id)

    return {
      auth_token: token,
      ...newUser,
    }
  }

  @Get('/')
  async getOwnerProfile() {
    return this.userService.getOwner().catch((err) => {
      if (
        err instanceof BizException &&
        err.code === ErrorCodeEnum.UserNotFound
      ) {
        throw new BizException(ErrorCodeEnum.NotInitialized)
      }
    })
  }
}
