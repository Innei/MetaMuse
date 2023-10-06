import { Switch } from '@nextui-org/react'

import { useI18n } from '~/i18n/hooks'

import { useNoteModelSingleFieldAtom } from '../data-provider'

export const NoteCombinedSwitch = () => {
  const [isPublished, setIsPublished] =
    useNoteModelSingleFieldAtom('isPublished')

  const [allowComment, setAllowComment] =
    useNoteModelSingleFieldAtom('allowComment')

  const t = useI18n()
  return (
    <>
      <div className="flex items-center justify-between">
        <span>{t('common.should-published')}</span>
        <Switch
          className="flex-shrink-0"
          size="sm"
          isSelected={isPublished}
          onValueChange={setIsPublished}
        />
      </div>

      <div className="flex items-center justify-between">
        <span>{t('common.allow-comment')}</span>
        <Switch
          className="flex-shrink-0"
          size="sm"
          isSelected={allowComment}
          onValueChange={setAllowComment}
        />
      </div>
    </>
  )
}
