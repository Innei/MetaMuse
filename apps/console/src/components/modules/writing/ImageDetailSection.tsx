import { Accordion, AccordionItem } from '@nextui-org/react'
import { Colorful } from '@uiw/react-color'
import { memo, useEffect, useMemo, useState } from 'react'
import uniqBy from 'lodash-es/uniqBy'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'
import type { NoteModel } from '~/models/note'
import type { FC } from 'react'

import {
  Divider,
  FloatPopover,
  Input,
  InputProvider,
  Label,
  LabelProvider,
} from '~/components/ui'
import { Button, ButtonGroup, MotionButtonBase } from '~/components/ui/button'
import { useI18n } from '~/i18n/hooks'
import { getDominantColor } from '~/lib/color'
import { pickImagesFromMarkdown } from '~/lib/markdown'

type ArticleImage = NoteModel['images'][number]

export interface ImageDetailSectionProps {
  images: ArticleImage[]
  onChange: (images: ArticleImage[]) => void
  text: string
  extraImages?: string[]

  withDivider?: 'top' | 'bottom' | 'both'
}

export const ImageDetailSection: FC<ImageDetailSectionProps> = (props) => {
  const { images, text, onChange, extraImages, withDivider } = props

  const originImageMap = useMemo(() => {
    const map = new Map<string, ArticleImage>()
    images.forEach((image) => {
      map.set(image.src, image)
    })
    return map
  }, [images])

  const fromText = useMemo(() => {
    return pickImagesFromMarkdown(text)
  }, [text])

  const hasTopDivider = withDivider === 'top' || withDivider === 'both'
  const hasBottomDivider = withDivider === 'bottom' || withDivider === 'both'

  const nextImages = useMemo<ArticleImage[]>(() => {
    const basedImages: ArticleImage[] = text
      ? uniqBy(
          fromText
            .map((src) => {
              const existImageInfo = originImageMap.get(src)

              return {
                src,
                height: existImageInfo?.height,
                width: existImageInfo?.width,
                type: existImageInfo?.type,
                accent: existImageInfo?.accent,
              } as any
            })
            .concat(images)
            .filter(Boolean),
          'src',
        )
      : images
    const srcSet = new Set<string>()

    for (const image of basedImages) {
      image.src && srcSet.add(image.src)
    }
    const nextImages = basedImages.concat()
    if (extraImages) {
      // 需要过滤存在的图片
      extraImages.forEach((src) => {
        if (!srcSet.has(src)) {
          nextImages.push({
            src,
            height: 0,
            width: 0,
            type: '',
            accent: '',
          })
        }
      })
    }

    return nextImages
  }, [extraImages, images, originImageMap, JSON.stringify(fromText)])

  const [loading, setLoading] = useState(false)
  const handleCorrectImageDimensions = useEventCallback(async () => {
    setLoading(true)

    const fetchImageTasks = await Promise.allSettled(
      images.map((item) => {
        return new Promise<ArticleImage>((resolve, reject) => {
          const $image = new Image()
          $image.src = item.src
          $image.crossOrigin = 'Anonymous'
          $image.onload = () => {
            resolve({
              width: $image.naturalWidth,
              height: $image.naturalHeight,
              src: item.src,
              type: $image.src.split('.').pop() || '',
              accent: getDominantColor($image),
            })
          }
          $image.onerror = (err) => {
            reject({
              err,
              src: item.src,
            })
          }
        })
      }),
    )

    setLoading(false)

    const nextImageDimensions = [] as ArticleImage[]
    fetchImageTasks.map((task) => {
      if (task.status === 'fulfilled') nextImageDimensions.push(task.value)
      else {
        toast.error(`获取图片信息失败：${task.reason.src}: ${task.reason.err}`)
      }
    })

    onChange(nextImageDimensions)

    setLoading(false)
  })

  const t = useI18n()

  const handleOnChange = useEventCallback(
    <T extends keyof ArticleImage>(
      src: string,
      key: T,
      value: ArticleImage[T],
    ) => {
      if (key == 'src' && value === '') {
        onChange(
          nextImages.filter((item) => {
            return item.src !== src
          }),
        )
        return
      }
      onChange(
        nextImages.map((item) => {
          if (item.src === src) {
            return {
              ...item,
              [key]: value,
            }
          }
          return item
        }),
      )
    },
  )

  if (!nextImages.length) return null

  return (
    <>
      {hasTopDivider && <Divider />}
      <div className="relative flex w-full flex-col">
        <div className="flex items-center justify-between space-x-2">
          <div className="inline-block flex-shrink flex-grow">
            {t('module.writing.image-adjust.title')}
          </div>
          <Button
            isLoading={loading}
            color="muted"
            className="self-end"
            size="xs"
            onClick={handleCorrectImageDimensions}
          >
            {t('module.writing.image-adjust.button')}
          </Button>
        </div>

        <Accordion className="mt-4" isCompact>
          {nextImages.map((image) => {
            return (
              <AccordionItem
                classNames={{
                  title: 'text-sm font-normal',
                }}
                key={image.src}
                title={<div className="break-all">{image.src}</div>}
              >
                <Item {...image} handleOnChange={handleOnChange} />
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
      {hasBottomDivider && <Divider />}
    </>
  )
}

const Item: FC<
  ArticleImage & {
    handleOnChange: <T extends keyof ArticleImage>(
      src: string,
      key: T,
      value: ArticleImage[T],
    ) => void
  }
> = memo(({ handleOnChange, ...image }) => {
  const t = useI18n()
  return (
    <div className="my-6 flex flex-col space-y-3">
      <LabelProvider className="w-20">
        <InputProvider labelPlacement="left">
          <Input
            label={t('common.height')}
            value={image.height?.toString() || ''}
            onChange={(e) => {
              const validValue = parseInt(e.target.value)
              if (Number.isNaN(validValue)) return
              handleOnChange(image.src, 'height', validValue)
            }}
          />
          <Input
            label={t('common.width')}
            value={image.width?.toString() || ''}
            onChange={(e) => {
              const validValue = parseInt(e.target.value)
              if (Number.isNaN(validValue)) return
              handleOnChange(image.src, 'width', validValue)
            }}
          />
          <Input
            label={t('common.type')}
            value={image.type?.toString() || ''}
            onChange={(e) => {
              handleOnChange(image.src, 'type', e.target.value)
            }}
          />
        </InputProvider>

        <div className="flex items-center gap-1">
          <Label htmlFor="color-picker">{t('common.accent')}</Label>
          <ColorPicker
            accent={image.accent || '#fff'}
            onChange={(hex) => {
              handleOnChange(image.src, 'accent', hex)
            }}
          />
        </div>

        <div className="flex items-center gap-1">
          <Label>{t('common.action')}</Label>
          <ButtonGroup variant="outline" size="xs">
            <Button
              onClick={() => {
                window.open(image.src)
              }}
              color="primary"
            >
              {t('common.visit')}
            </Button>
            <Button
              onClick={() => {
                handleOnChange(image.src, 'src', '')
              }}
              color="destructive"
            >
              {t('common.delete')}
            </Button>
          </ButtonGroup>
        </div>
      </LabelProvider>
    </div>
  )
})

Item.displayName = 'AccordionItem'

const ColorPicker: FC<{
  accent: string
  onChange: (hex: string) => void
}> = ({ accent, onChange }) => {
  const [currentColor, setCurrentColor] = useState(accent)
  useEffect(() => {
    setCurrentColor(accent)
  }, [accent])

  return (
    <FloatPopover
      triggerElement={
        <MotionButtonBase
          id="color-picker"
          className="ring-default-200 h-6 w-6 rounded-full bg-current ring"
          style={{
            backgroundColor: currentColor || '',
          }}
        />
      }
    >
      <ColorPickerContent
        accent={currentColor || '#fff'}
        onChange={useEventCallback((hex) => {
          setCurrentColor(hex)
        })}
        onDestroy={useEventCallback(() => {
          onChange(currentColor)
        })}
      />
    </FloatPopover>
  )
}

const ColorPickerContent: FC<{
  accent: string
  onDestroy: () => void
  onChange: (hex: string) => void
}> = ({ accent, onChange, onDestroy }) => {
  useEffect(() => {
    return () => {
      onDestroy()
    }
  }, [onDestroy])

  return (
    <Colorful
      color={accent}
      onChange={({ hex }) => {
        onChange(hex)
      }}
    />
  )
}
