import { FastifyReply, FastifyRequest } from 'fastify'
import { lookup } from 'mime-types'
import { path } from 'zx-cjs'

import { ApiController } from '@core/common/decorators/api-controller.decorator'
import { Auth } from '@core/common/decorators/auth.decorator'
import { HTTPDecorators } from '@core/common/decorators/http.decorator'
import { BizException } from '@core/common/exceptions/biz.exception'
import { ErrorCodeEnum } from '@core/constants/error-code.constant'
import { UploadService } from '@core/processors/helper/services/helper.upload.service'
import { PagerDto } from '@core/shared/dto/pager.dto'
import { md5Stream } from '@core/shared/utils/md5.util'
import { Delete, Get, Param, Post, Query, Req, Res } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { FileQueryDto, FileUploadDto } from './file.dto'
import { FileService } from './file.service'

@ApiController(['objects', 'files'])
export class FileController {
  constructor(
    private readonly service: FileService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('/:type')
  @Auth()
  async getTypes(@Query() query: PagerDto, @Param() params: FileUploadDto) {
    const { type = 'file' } = params
    // const { page, size } = query
    const dir = await this.service.getDir(type)
    return Promise.all(
      dir.map(async (name) => {
        return { name, url: await this.service.resolveFileUrl(type, name) }
      }),
    )
  }

  @Get('/:type/:name')
  @Throttle({
    default: {
      limit: 60,
      ttl: 60_000,
    },
  })
  @HTTPDecorators.Bypass
  async get(@Param() params: FileQueryDto, @Res() reply: FastifyReply) {
    const { type, name } = params
    const ext = path.extname(name)
    const mimetype = lookup(ext)

    try {
      const stream = await this.service.getFileStream(type, name)
      if (mimetype) {
        reply.type(mimetype)
        reply.header('cache-control', 'public, max-age=31536000')
        reply.header(
          'expires',
          new Date(Date.now() + 31536000 * 1000).toUTCString(),
        )
      }

      return reply.send(stream)
    } catch {
      throw new BizException(ErrorCodeEnum.ResourceNotFound)
    }
  }

  @Post('/upload')
  @Auth()
  async upload(@Query() query: FileUploadDto, @Req() req: FastifyRequest) {
    const file = await this.uploadService.getAndValidMultipartField(req)

    const { type = 'file' } = query

    const ext = path.extname(file.filename)

    const filename = (await md5Stream(file.file)) + ext

    if (!(await this.service.exists(type, filename))) {
      await this.service.writeFile(type, filename, file.file)
    }

    return {
      url: await this.service.resolveFileUrl(type, filename),
      name: filename,
    }
  }

  @Delete('/:type/:name')
  @Auth()
  async delete(@Param() params: FileQueryDto) {
    const { type, name } = params
    await this.service.deleteFile(type, name)
  }
}
