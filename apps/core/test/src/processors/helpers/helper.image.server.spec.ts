import { HttpService } from '@core/processors/helper/services/helper.http.service'
import { ImageService } from '@core/processors/helper/services/helper.image.service'
import { Test } from '@nestjs/testing'
import { mockedConfigsServiceProvider } from '@test/mock/modules/configs.mock'

describe('Testing ImageService', () => {
  let imageService: ImageService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ImageService, HttpService, mockedConfigsServiceProvider],
    }).compile()

    imageService = moduleRef.get<ImageService>(ImageService)

    vi.spyOn(imageService, 'getOnlineImageSizeAndMeta').mockImplementation(
      async () => {
        return {
          size: {
            width: 100,
            height: 100,
          },
          accent: '#333',
        }
      },
    )
  })

  it('should saveImageDimensionsFromMarkdownText', async () => {
    const markdownWithImages = `
111

![image](https://user-images.githubusercontent.com/12001979/120887724-5b0b6b00-c61a-11eb-8b9a-8b8b8b8b8b8b.png)

aaaaaaa
`
    const newImages = await imageService.saveImageDimensionsFromMarkdownText(
      markdownWithImages,
      [],
    )
    expect(newImages).toMatchInlineSnapshot(`
      [
        {
          "accent": "#333",
          "height": 100,
          "src": "https://user-images.githubusercontent.com/12001979/120887724-5b0b6b00-c61a-11eb-8b9a-8b8b8b8b8b8b.png",
          "type": "",
          "width": 100,
        },
      ]
    `)
  })
})
