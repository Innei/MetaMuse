import imageSize from 'image-size'

import { ConfigsService } from '@core/modules/configs/configs.service'
import { ArticleImagesDto } from '@core/shared/dto/image.dto'
import { getAverageRGB, pickImagesFromMarkdown } from '@core/utils/pic.util'
import { Inject, Injectable, Logger } from '@nestjs/common'

import { HttpService } from './helper.http.service'

type ArticleImage = ArticleImagesDto[number]

@Injectable()
export class ImageService {
  private readonly logger: Logger = new Logger(ImageService.name)

  @Inject(HttpService)
  private readonly httpService: HttpService

  @Inject(ConfigsService)
  private readonly configsService: ConfigsService

  async saveImageDimensionsFromMarkdownText(
    text: string,
    originImages: ArticleImage[] | undefined,
    onUpdate?: (images: ArticleImage[]) => Promise<any>,
  ) {
    const newImageSrcSet = new Set(pickImagesFromMarkdown(text))
    const newImages = [...newImageSrcSet]

    const result = [] as ArticleImage[]

    const oldImagesMap = new Map(
      (originImages ?? []).map((image) => [image.src, image]),
    )
    const task = [] as Promise<ArticleImage | null>[]
    for (const src of newImages) {
      const originImage = oldImagesMap.get(src)
      const keys = new Set(Object.keys(originImage || {}))

      // 原有图片 和 现有图片 src 一致 跳过
      if (
        originImage &&
        originImage.src === src &&
        ['height', 'width', 'type', 'accent'].every(
          (key) => keys.has(key) && originImage[key],
        )
      ) {
        result.push(originImage)
        continue
      }
      const promise = new Promise<ArticleImage | null>((resolve) => {
        this.logger.log(`Get --> ${src}`)
        this.getOnlineImageSizeAndMeta(src)
          .then(({ size, accent }) => {
            const filename = src.split('/').pop()
            this.logger.debug(
              `[${filename}]: height: ${size.height}, width: ${size.width}, accent: ${accent}`,
            )

            resolve({ ...size, type: size.type || '', accent, src })
          })
          .catch((e) => {
            this.logger.error(`GET --> ${src} ${e.message}`)

            const oldRecord = oldImagesMap.get(src)
            if (oldRecord) {
              resolve(oldRecord)
            } else resolve(null)
          })
      })

      task.push(promise)
    }
    const images = await Promise.all(task)
    result.push(...(images.filter(Boolean) as ArticleImage[]))

    // 老图片不要过滤，记录到列头

    if (originImages) {
      for (const oldImageRecord of originImages) {
        const src = oldImageRecord.src
        if (src && !newImageSrcSet.has(src)) {
          result.unshift(oldImageRecord)
        }
      }
    }

    await onUpdate?.(result)

    return result
  }

  getOnlineImageSizeAndMeta = async (image: string) => {
    const {
      url: { webUrl },
    } = await this.configsService.waitForConfigReady()

    const task = this.httpService.axiosRef.get(image, {
      responseType: 'arraybuffer',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
        referer: webUrl,
      },
    })
    const { data, headers } = await this.httpService.queryClient.fetchQuery({
      queryKey: ['image', image],
      queryFn: () => task,
    })

    const imageType = headers['content-type']!

    const buffer = Buffer.from(data)
    const size = imageSize(buffer)

    // get accent color
    const accent = await getAverageRGB(buffer, imageType)

    return { size, accent }
  }
}
