import { Input } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

import { useI18n } from '~/i18n/hooks'
import { isValidDate } from '~/lib/datetime'

import { usePostModelSingleFieldAtom } from '../data-provider'

export const CustomCreatedInput = () => {
  const [created, setCreated] = usePostModelSingleFieldAtom('created')
  const t = useI18n()

  const [editingCreated, setEditingCreated] = useState(created)

  const [reset, setReset] = useState(0)
  useEffect(() => {
    if (!created) return
    setEditingCreated(dayjs(created).format('YYYY-MM-DD HH:mm:ss'))
  }, [created, reset])

  const [hasError, setHasError] = useState(false)
  useEffect(() => {
    if (!editingCreated) return
    if (isValidDate(new Date(editingCreated))) {
      setHasError(false)
    } else setHasError(true)
  }, [editingCreated, setCreated])

  return (
    <Input
      label={t('common.custom-created')}
      size="sm"
      value={editingCreated}
      errorMessage={hasError ? t('common.invalid-date') : undefined}
      color={hasError ? 'danger' : 'default'}
      labelPlacement="outside"
      placeholder={created || ' '}
      onBlur={() => {
        if (!hasError) {
          setCreated(editingCreated)
        }
      }}
      onChange={(e) => {
        setEditingCreated(e.target.value)
      }}
    />
  )
}
