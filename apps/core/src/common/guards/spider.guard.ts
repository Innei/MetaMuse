/**
 * @module common/guard/spider.guard
 * @description 禁止爬虫的守卫
 * @author Innei <https://innei.in>
 */
import { Observable } from 'rxjs'

import { isDev } from '@core/global/env.global'
import { getNestExecutionContextRequest } from '@core/transformers/get-req.transformer'
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

@Injectable()
export class SpiderGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (isDev) {
      return true
    }

    const request = this.getRequest(context)
    const headers = request.headers
    const ua: string = headers['user-agent'] || ''
    const isSpiderUA =
      !!ua.match(/(Scrapy|HttpClient|axios|python|requests)/i) &&
      !ua.match(/(mx-space|rss|google|baidu|bing)/gi)
    if (ua && !isSpiderUA) {
      return true
    }
    throw new ForbiddenException(`爬虫是被禁止的哦，UA: ${ua}`)
  }

  getRequest(context: ExecutionContext) {
    return getNestExecutionContextRequest(context)
  }
}
