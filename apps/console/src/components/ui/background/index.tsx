import { Input } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { toast } from 'sonner'
import { z } from 'zod'

import { useUncontrolledInput } from '~/hooks/common/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'
import { isLogged, useIsLogged } from '~/store/user'

import { Button } from '../button'
import { useCurrentModal } from '../modal'
import { DeclarativeModal } from '../modal/stacked/declarative-modal'
import styles from './index.module.css'

const KV_KEY = 'login-background'

export const Background = () => {
  const { data: bg } = trpc.configs.kv.getPublic.useQuery(
    {
      key: KV_KEY,
    },
    {
      select: (data) => JSON.parse(data || "''") as string,
    },
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isLogged = useIsLogged()

  const [isImageLoaded, setIsImageLoaded] = useState(false)
  useEffect(() => {
    if (bg) {
      setIsImageLoaded(false)
      const img = new Image()
      img.src = bg
      img.onload = () => {
        setIsImageLoaded(true)
      }
    }
  }, [bg])
  return (
    <div className="absolute h-full w-full overflow-hidden">
      <div
        className={clsx(
          'absolute inset-[-100px] z-0 filter transition-opacity duration-500',
          styles.bg,
        )}
        style={
          bg
            ? {
                opacity: isImageLoaded ? 1 : 0,
                backgroundImage: `url(${bg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                filter: 'blur(5px)',
              }
            : undefined
        }
      />

      {isLogged && (
        <Button
          className="rounded-full fixed bottom-4 right-4"
          iconOnly
          color="muted"
          onClick={() => {
            setIsModalOpen(true)
          }}
        >
          <i className="icon-[mingcute--settings-5-line]" />
        </Button>
      )}
      <DeclarativeModal
        title="Background Setting"
        open={isModalOpen}
        onOpenChange={() => {
          setIsModalOpen(false)
        }}
      >
        <BackgroundModal />
      </DeclarativeModal>
    </div>
  )
}

const BackgroundModal = () => {
  const { mutateAsync } = trpc.configs.kv.setPublic.useMutation()
  const { data: bg } = trpc.configs.kv.getPublic.useQuery({
    key: KV_KEY,
  })

  const [, getValue, ref] = useUncontrolledInput(bg)
  const t = useI18n()
  const utils = trpc.useUtils()

  const { dismiss } = useCurrentModal()
  return (
    <div className="lg:w-[500px]">
      <div className="flex flex-col space-y-4">
        <Input label="Background URL" placeholder=" " ref={ref} size="sm" />
      </div>
      <DeclarativeModal.FooterAction>
        <Button
          size="sm"
          onClick={async () => {
            if (!isLogged()) return

            const result = await z.string().url().safeParseAsync(getValue())
            if (!result.success) {
              toast.error('Invalid URL')
              return
            }
            const value = result.data
            mutateAsync({
              key: KV_KEY,
              value,
            })
            dismiss()
            utils.configs.kv.getPublic.setData(
              {
                key: KV_KEY,
              },
              () => JSON.stringify(value),
            )

            utils.configs.kv.getPublic.invalidate({
              key: KV_KEY,
            })
          }}
          color="primary"
        >
          {t('common.save')}
        </Button>
      </DeclarativeModal.FooterAction>
    </div>
  )
}
