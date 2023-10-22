import { Modal } from '@nextui-org/react'
import type { ModalProps } from '@nextui-org/react'
import type { FC, PropsWithChildren } from 'react'

import { clsxm } from '~/lib/helper'

export const NextUIModal: FC<PropsWithChildren<ModalProps>> = ({
  children,
  classNames,

  ...props
}) => {
  return (
    <Modal
      classNames={{
        closeButton: clsxm(
          'absolute right-2 top-2 !h-5 !w-5 flex items-center justify-center box-content',
          classNames?.closeButton,
        ),
        header: clsxm('w-[calc(100%-2rem)]', classNames?.header),
        backdrop: 'bg-slate-50/80 dark:bg-neutral-900/80',
        ...classNames,
      }}
      {...props}
    >
      {children}
    </Modal>
  )
}
