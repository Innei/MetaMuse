import { Controller, Get } from '@nestjs/common'

import PKG from '../package.json'
import { DEMO_MODE } from './app.config'
import { isDev } from './global/env.global'

@Controller()
export class AppController {
  @Get('ping')
  ping(): 'pong' {
    return 'pong'
  }

  @Get()
  home() {
    return {
      name: PKG.name,
      author: PKG.author,
      version: isDev ? 'dev' : `${DEMO_MODE ? 'demo/' : ''}${PKG.version}`,
      homepage: PKG.homepage,
      issues: PKG.issues,
    }
  }
}
