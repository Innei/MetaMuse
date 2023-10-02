import { Button } from '@nextui-org/react'
import { useEffect, useRef } from 'react'
import debounce from 'lodash-es/debounce'
import { toast } from 'sonner'
import type { UrlDto } from '@core/modules/configs/configs.dto'

import { EmitKeyMap } from '~/constants/keys'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

// TODO testing
export const PreviewButton = <T extends { id: string }>(props: {
  getData: () => T
}) => {
  const utils = trpc.useContext()

  const isInPreview = useRef(false)
  const previewWindowOrigin = useRef('')
  const previewWindow = useRef<Window | null>(null)

  const handlePreview = async () => {
    const { webUrl } = (await utils.aggregate.queryConfigByKey.fetch({
      key: 'url',
    })) as UrlDto

    let url: URL
    if (import.meta.env.DEV) {
      url = new URL('/preview', 'http://localhost:2323')
    } else {
      url = new URL('/preview', webUrl)
    }

    url.searchParams.set('origin', location.origin)

    const finalUrl = url.toString()

    const forkWindow = window.open(finalUrl)
    if (!forkWindow) {
      toast.error('打开预览失败')
      return
    }

    isInPreview.current = true
    previewWindowOrigin.current = url.origin
    previewWindow.current = forkWindow
  }

  useEffect(() => {
    const handler = (e: MessageEvent<any>): void => {
      if (!isInPreview.current) return
      if (e.origin !== previewWindowOrigin.current) return
      // console.log('ready', e.origin)
      if (!previewWindow.current) return
      const data = props.getData()
      previewWindow.current.postMessage(
        JSON.stringify({
          type: 'preview',
          data: {
            ...data,
            id: `preview-${data.id ?? 'new'}`,
          },
        }),
        previewWindowOrigin.current,
      )
    }
    window.addEventListener('message', handler)

    return () => {
      window.removeEventListener('message', handler)
    }
  })

  useEffect(() => {
    const handler = debounce(() => {
      if (!isInPreview.current) return
      if (!previewWindowOrigin.current) return
      if (!previewWindow.current) return

      const data = props.getData()

      previewWindow.current.postMessage(
        JSON.stringify({
          type: 'preview',
          data: {
            ...data,
            id: `preview-${data.id ?? 'new'}`,
          },
        }),
        previewWindowOrigin.current,
      )
    }, 100)
    window.addEventListener(EmitKeyMap.EditDataUpdate, handler)

    return () => {
      window.removeEventListener(EmitKeyMap.EditDataUpdate, handler)
    }
  })

  const t = useI18n()
  return <Button onClick={handlePreview}>{t('common.preview')}</Button>
}
