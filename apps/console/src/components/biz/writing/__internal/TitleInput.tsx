import { Input } from '@nextui-org/react'
import type { FC } from 'react'

import { useI18n } from '~/i18n/hooks'

import { useBaseWritingAtom } from '../provider'

export const TitleInput: FC<{
  label?: String
}> = ({ label }) => {
  const [title, setTitle] = useBaseWritingAtom('title')
  const t = useI18n()
  return (
    <Input
      classNames={{
        input: 'font-medium text-md',
      }}
      size="lg"
      color="primary"
      label={label || t('common.title')}
      value={title}
      variant="bordered"
      onChange={(e) => setTitle(e.target.value)}
    />
  )
}
