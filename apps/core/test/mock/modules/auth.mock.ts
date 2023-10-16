import { AuthService } from '@core/modules/auth/auth.service'
import { defineProvider } from '@test/helper/defineProvider'

export const authProvider = defineProvider({
  useValue: {},
  provide: AuthService,
})
