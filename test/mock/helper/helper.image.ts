import { ImageService } from '@core/processors/helper/helper.image.service'
import { Injectable } from '@nestjs/common'
import { defineProvider } from '@test/helper/defineProvider'

@Injectable()
export class MockedImageService {
  async saveImageDimensionsFromMarkdownText(
    markdownText: string,
    images: any[],
    onUpdate?: (images?: any) => void,
  ): Promise<any[]> {
    return images
  }

  async getOnlineImageSizeAndMeta(
    src: string,
  ): Promise<{ size: { width: number; height: number }; accent: string }> {
    return {
      size: {
        width: 100,
        height: 100,
      },
      accent: '#333',
    }
  }
}

export const mockedImageServiceProvider = defineProvider({
  provide: ImageService,
  useValue: new MockedImageService(),
})
