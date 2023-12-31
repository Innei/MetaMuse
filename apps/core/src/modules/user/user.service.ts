import { compareSync, hashSync } from 'bcrypt'

import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { CacheService } from '@core/processors/cache/cache.service'
import { DatabaseService } from '@core/processors/database/database.service'
import { resourceNotFoundWrapper } from '@core/shared/utils/prisma.util'
import { Prisma } from '@meta-muse/prisma'
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'

import { UserRegisterDto } from './dtos/register.dto'
import {
  UserSchemaProjection,
  UserSchemaSerializeProjection,
} from './user.protect'

@Injectable()
export class UserService {
  private Logger = new Logger(UserService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async register(userDto: UserRegisterDto) {
    const isExist = await this.db.prisma.user.exists({
      where: {
        username: userDto.username,
      },
    })

    if (isExist) {
      throw new BizException(ErrorCodeEnum.UserExist)
    }

    const model = await this.db.prisma.user.create({
      data: {
        ...userDto,
        password: hashSync(userDto.password, 10),
      },
    })

    return model
  }

  /**
   * 修改密码
   *
   * @async
   * @param {string} id - 用户 id
   * @param {Partial} data - 部分修改数据
   */
  async patchUserData(id: string, data: Partial<Prisma.UserCreateInput>) {
    const { password } = data

    for (const key in UserSchemaProjection) {
      if (key in data) {
        delete data[key]
      }
    }

    const doc = { ...data }
    if (password !== undefined) {
      const currentUser = await this.db.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          password: true,
          apiTokens: true,
        },
      })

      if (!currentUser) {
        throw new BizException(ErrorCodeEnum.UserNotFound)
      }
      // 1. 验证新旧密码是否一致
      const isSamePassword = compareSync(password, currentUser.password)
      if (isSamePassword) {
        throw new UnprocessableEntityException('密码可不能和原来的一样哦')
      }
    }

    await this.db.prisma.user.update({
      where: {
        id,
      },
      data: doc,
    })
  }

  /**
   * 记录登陆的足迹 (ip, 时间)
   *
   * @async
   * @param {string} ip - string
   * @return {Promise<Record<string, Date|string>>} 返回上次足迹
   */
  async recordFootstep(ip: string): Promise<Record<string, Date | string>> {
    const master = await this.db.prisma.user.findFirst()
    if (!master) {
      throw new BizException(ErrorCodeEnum.UserNotFound)
    }
    const PrevFootstep = {
      lastLoginTime: master.lastLoginTime || new Date(1586090559569),
      lastLoginIp: master.lastLoginIp || null,
    }
    await this.db.prisma.user.update({
      where: {
        id: master.id,
      },
      data: {
        lastLoginTime: new Date(),
        lastLoginIp: ip,
      },
    })

    this.Logger.warn(`主人已登录，IP: ${ip}`)
    return PrevFootstep as any
  }

  getOwner() {
    return this.cacheService.cacheGet({
      expireTime: 60,
      key: 'owner',
      getValueFun: async () => {
        return this.db.prisma.user
          .findFirstOrThrow()
          .catch(
            resourceNotFoundWrapper(
              new BizException(ErrorCodeEnum.UserNotFound),
            ),
          )
          .then((res) => {
            return UserSchemaSerializeProjection.serialize(res)
          })
      },
    })
  }
}
