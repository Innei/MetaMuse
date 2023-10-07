import { Input } from '@nextui-org/react'

import { useI18n } from '~/i18n/hooks'

import { useNoteModelSingleFieldAtom } from '../data-provider'

export const PasswordInput = () => {
  const [password, setPassword] = useNoteModelSingleFieldAtom('password')

  const t = useI18n()
  return (
    <Input
      size="sm"
      type="password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value)
      }}
      labelPlacement="outside"
      label={t('common.password')}
      placeholder={' '}
    />
  )
}
