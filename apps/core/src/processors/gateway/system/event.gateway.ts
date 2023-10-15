import { CacheService } from '@core/processors/cache/cache.service'
import { JWTService } from '@core/processors/helper/services/helper.jwt.service'
import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets'

import { AuthService } from '../../../modules/auth/auth.service'
import { createAuthGateway } from '../shared/auth.gateway'

const AuthGateway = createAuthGateway({
  namespace: 'system',
  authway: 'custom-token',
})

@WebSocketGateway<GatewayMetadata>({ namespace: 'system' })
export class SystemEventsGateway
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
}
