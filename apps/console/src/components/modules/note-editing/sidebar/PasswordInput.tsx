import { Input } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'

import { useNoteModelSingleFieldAtom } from '../data-provider'

export const PasswordInput = () => {
  const [password, setPassword] = useNoteModelSingleFieldAtom('password')

  const t = useI18n()
  return (
    <Input
      type="password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value)
      }}
      label={t('common.password')}
    />
  )
}
