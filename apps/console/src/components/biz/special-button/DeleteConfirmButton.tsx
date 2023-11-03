import { toast } from 'sonner'
import type { FC, PropsWithChildren } from 'react'

import { Button } from '~/components/ui/button'
import { FloatPopover } from '~/components/ui/float-popover'
import { useI18n } from '~/i18n/hooks'

export const DeleteConfirmButton: FC<
  {
    onDelete: () => Promise<any>
    confirmText?: string
    deleteItemText?: string
  } & PropsWithChildren
> = (props) => {
  const { onDelete, confirmText, deleteItemText } = props
  const t = useI18n()

  const defaultButton = (
    <Button
      size="xs"
      variant="destructive"
      onClick={() => {
        onDelete().then(() => {
          toast.success(t('common.delete-success'))
        })
      }}
    >
      {t('common.sure')}
    </Button>
  )

  return (
    <FloatPopover
      trigger="click"
      triggerElement={
        <Button size="xs" variant="text" color="destructive">
          {t('common.delete')}
        </Button>
      }
    >
      <div className="p-4 flex">
        <p className="text-center text-red-500 text-base font-bold">
          {confirmText ??
            (deleteItemText
              ? t('common.confirm-delete-item', { item: deleteItemText })
              : t('common.confirm-delete'))}
        </p>
      </div>
      <div className="text-right">{props.children || defaultButton}</div>
    </FloatPopover>
  )
}
