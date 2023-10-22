import { useI18n } from '~/i18n/hooks'

import { SidebarDateInputField } from '../../writing/SidebarDateInputField'
import { useNoteModelSingleFieldAtom } from '../data-provider'

export const CustomCreatedInput = () => {
  return (
    <SidebarDateInputField getSet={useNoteModelSingleFieldAtom('created')} />
  )
}

export const PublicAtInput = () => {
  const t = useI18n()
  return (
    <SidebarDateInputField
      getSet={useNoteModelSingleFieldAtom('publicAt')}
      label={t('module.notes.public_at')}
    />
  )
}
