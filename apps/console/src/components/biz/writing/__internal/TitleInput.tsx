import { Input } from '@nextui-org/react'

import { useI18n } from '~/i18n/hooks'

import { useBaseWritingAtom } from '../provider'

export const TitleInput = () => {
  const [title, setTitle] = useBaseWritingAtom('title')
  const t = useI18n()
  return (
    <Input
      classNames={{
        input: 'font-medium',
      }}
      color="primary"
      label={t('common.title')}
      value={title}
      variant="bordered"
      onChange={(e) => setTitle(e.target.value)}
    />
  )
}
