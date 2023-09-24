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
} from './aggregate.dto'

@ApiController('aggregate')
export class AggregateController {
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
}
