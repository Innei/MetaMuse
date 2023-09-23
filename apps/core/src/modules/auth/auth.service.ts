import { compareSync } from 'bcrypt'
import dayjs from 'dayjs'
import { isDate } from 'lodash'

import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { DatabaseService } from '@core/processors/database/database.service'
import { JWTService } from '@core/processors/helper/helper.jwt.service'
import { sleep } from '@core/shared/utils/tool.utils'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JWTService,
  ) {}

  get jwtServicePublic() {
    return this.jwtService
  }

  async validateUsernameAndPassword(username: string, password: string) {
    const user = await this.db.prisma.user.findUnique({
      where: {
        username,
      },
    })

    if (!user || !compareSync(password, user.password)) {
      await sleep(3000)
      throw new BizException(ErrorCodeEnum.AuthFail)
    }

    return user
  }

  isCustomToken(token: string) {
    return token.startsWith('txo') && token.length - 3 === 40
  }

  async verifyCustomToken(token: string) {
    const apiTokenRecord = await this.db.prisma.apiToken.findFirst({
      where: { token },
    })

    if (!apiTokenRecord) {
      return false
    }

    if (typeof apiTokenRecord.expired === 'undefined') {
      return true
    } else if (isDate(apiTokenRecord.expired)) {
      const isExpired = dayjs(new Date()).isAfter(apiTokenRecord.expired)
      return isExpired ? false : true
    }
  }

  /**
   * 验证 custom token and jwt token
   * @param token
   * @returns ErrorCodeEnum | true
   */
  async validate(token: string) {
    if (this.isCustomToken(token)) {
      const isValid = await this.verifyCustomToken(token)
      if (!isValid) {
        return ErrorCodeEnum.JWTInvalid
      }

      return true
    }

    const jwt = token.replace(/[Bb]earer /, '')

    if (!isJWT(jwt)) {
      return ErrorCodeEnum.JWTInvalid
    }
    const ok = await this.jwtServicePublic.verify(jwt)
    if (!ok) {
      return ErrorCodeEnum.JWTExpired
    }
    return true
  }
}

function isJWT(token: string): boolean {
  const parts = token.split('.')
  return (
    parts.length === 3 &&
    /^[a-zA-Z0-9_-]+$/.test(parts[0]) &&
    /^[a-zA-Z0-9_-]+$/.test(parts[1]) &&
    /^[a-zA-Z0-9_-]+$/.test(parts[2])
  )
}
