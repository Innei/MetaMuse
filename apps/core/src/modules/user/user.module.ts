import { Global, Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserTrpcRouter } from './user.trpc'

@Module({
  controllers: [UserController],
  providers: [UserService, UserTrpcRouter],
  imports: [AuthModule],
  exports: [UserService, UserTrpcRouter],
})
@Global()
export class UserModule {}
