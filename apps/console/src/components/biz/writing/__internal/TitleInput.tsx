import type { FC } from 'react'

import { Input } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'

import { useBaseWritingAtom } from '../provider'

export const TitleInput: FC<{
  label?: string
}> = ({ label }) => {
  const [title, setTitle] = useBaseWritingAtom('title')
  const t = useI18n()
  return (
    <Input
      color="primary"
      labelPlacement="inside"
      label={label || t('common.title')}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  )
}
