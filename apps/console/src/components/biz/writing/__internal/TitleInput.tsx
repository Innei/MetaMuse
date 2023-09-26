import { Input } from '@nextui-org/react'
import { useAtom } from 'jotai'

import { useI18n } from '~/i18n/hooks'

import { useBaseWritingContext } from '../provider'

export const TitleInput = () => {
  const [title, setTitle] = useAtom(useBaseWritingContext().title)
  const t = useI18n()
  return (
    <Input
      color="primary"
      label={t('common.title')}
      value={title}
      variant="bordered"
      onChange={(e) => setTitle(e.target.value)}
    />
  )
}
