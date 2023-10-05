import {
  Button,
  Input,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useModalContext,
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { useUncontrolledInput } from '~/hooks/common/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'
import { isLogged, useIsLogged } from '~/store/user'

import { NextUIModal } from '../modal'
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
          variant="light"
          isIconOnly
          onClick={() => {
            setIsModalOpen(true)
          }}
        >
          <i className="icon-[mingcute--settings-5-line]" />
        </Button>
      )}
      <NextUIModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
      >
        <BackgroundModal />
      </NextUIModal>
    </div>
  )
}

const BackgroundModal = () => {
  const { mutateAsync } = trpc.configs.kv.setPublic.useMutation()
  const { data: bg } = trpc.configs.kv.getPublic.useQuery({
    key: KV_KEY,
  })
  const { onClose } = useModalContext()

  const [, getValue, ref] = useUncontrolledInput(bg)
  const t = useI18n()
  const utils = trpc.useContext()

  return (
    <ModalContent>
      <ModalHeader>Background Setting</ModalHeader>
      <div className="flex flex-col space-y-4 px-4">
        <Input label="Background URL" placeholder=" " ref={ref} size="sm" />
      </div>
      <ModalFooter>
        <div className="flex flex-end">
          <Button
            size="sm"
            variant="shadow"
            onClick={() => {
              if (!isLogged()) return
              mutateAsync({
                key: KV_KEY,
                value: getValue(),
              })
              onClose()
              utils.configs.kv.getPublic.setData(
                {
                  key: KV_KEY,
                },
                () => JSON.stringify(getValue()),
              )

              utils.configs.kv.getPublic.invalidate({
                key: KV_KEY,
              })
            }}
            color="primary"
          >
            {t('common.save')}
          </Button>
        </div>
      </ModalFooter>
    </ModalContent>
  )
}
