import { omit } from 'lodash'

import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { CacheTTL } from '@nestjs/cache-manager'
import { forwardRef, Get, Inject, Param, Query } from '@nestjs/common'

import { CategoryService } from '../category/category.service'
import { ConfigsService } from '../configs/configs.service'
import { NoteService } from '../note/note.service'
import { PageService } from '../page/page.service'
import { UserService } from '../user/user.service'
import {
  AggregateInfoQueryKeyDto,
  AggregateQueryDto,
  infoQueryAllowedKeys,
  ReadAndLikeCountDocumentType,
  ReadAndLikeCountTypeDto,
} from './aggregate.dto'
import { AggregateService } from './aggregate.service'

@ApiController('aggregate')
export class AggregateController {
  @Inject(AggregateService)
  aggregateService: AggregateService
  @Inject(UserService)
  userService: UserService

  @Inject(ConfigsService)
  configsService: ConfigsService

  @Inject(forwardRef(() => CategoryService))
  categoryService: CategoryService

  @Inject(NoteService)
  noteService: NoteService

  @Inject(PageService)
  pageService: PageService

  @Get('/')
  @CacheTTL(10 * 60)
  async aggregate(@Query() query: AggregateQueryDto) {
    const { theme } = query

    const [user, categories, pageMeta, url, seo, latestNodeId, themeConfig] =
      await Promise.all([
        this.userService.getOwner(),
        this.categoryService.getAll(),
        this.pageService.getAllPages(),
        this.configsService.get('url'),
        this.configsService.get('seo'),
        this.noteService.getLatestNoteId(),
        // TODO

        Promise.resolve(),
      ])
    return {
      user,
      seo,
      url: omit(url, ['adminUrl']),
      categories,
      pageMeta,
      latestNodeId,
      theme: themeConfig,
    }
  }

  @Get('/info/:key')
  async getInfoByKey(@Param() parmas: AggregateInfoQueryKeyDto) {
    const { key } = parmas
    if (!infoQueryAllowedKeys.includes(key)) {
      throw new BizException(ErrorCodeEnum.InvalidQuery)
    }
    return this.configsService.get(key).then((result) => {
      const finalResult = { ...result }
      if (key === 'url' && 'adminUrl' in finalResult) {
        Reflect.deleteProperty(finalResult, 'adminUrl')
      }

      return finalResult
    })
  }

  @Get('/count_read_and_like')
  async getAllReadAndLikeCount(@Query() query: ReadAndLikeCountTypeDto) {
    const { type = ReadAndLikeCountDocumentType.All } = query
    return await this.aggregateService
      .getAllReadAndLikeCount(type)
      .then((c) => {
        // bigInt to number
        return Object.keys(c).reduce((acc, cur) => {
          acc[cur] = Number(c[cur])
          return acc
        }, {})
      })
  }

  @Get('/count_site_words')
  async getSiteWords() {
    return {
      length: await this.aggregateService.getAllSiteWordsCount(),
    }
  }
}
