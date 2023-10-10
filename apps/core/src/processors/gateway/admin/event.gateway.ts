import SocketIO from 'socket.io'

import { AuthService } from '@core/modules/auth/auth.service'
import { CacheService } from '@core/processors/cache/cache.service'
import { JWTService } from '@core/processors/helper/helper.jwt.service'
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets'

import { createAuthGateway } from '../shared/auth.gateway'

const AuthGateway = createAuthGateway({ namespace: 'admin', authway: 'jwt' })
@WebSocketGateway<GatewayMetadata>({ namespace: 'admin' })
export class AdminEventsGateway
  extends AuthGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    protected readonly jwtService: JWTService,
    protected readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {
    super(jwtService, authService, cacheService)
  }
  handleDisconnect(client: SocketIO.Socket) {
    super.handleDisconnect(client)
  }
}
