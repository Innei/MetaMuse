import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react'
import { toast } from 'sonner'
import type { FC } from 'react'

import { useI18n } from '~/i18n/hooks'

export const DeleteConfirmButton: FC<{
  onDelete: () => Promise<void>
  confirmText?: string
  deleteItemText?: string
}> = (props) => {
  const { onDelete, confirmText, deleteItemText } = props
  const t = useI18n()
  return (
    <Popover>
      <PopoverTrigger>
        <Button size="sm" variant="light" color="danger">
          {t('common.delete')}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-4">
          <p className="text-center text-red-500 text-base font-bold">
            {confirmText ??
              (deleteItemText
                ? t('common.confirm-delete-item', { item: deleteItemText })
                : t('common.confirm-delete'))}
          </p>
        </div>
        <div>
          <Button
            size="sm"
            variant="light"
            color="danger"
            onClick={() => {
              onDelete().then(() => {
                toast.success(t('common.delete-success'))
              })
            }}
          >
            {t('common.sure')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
