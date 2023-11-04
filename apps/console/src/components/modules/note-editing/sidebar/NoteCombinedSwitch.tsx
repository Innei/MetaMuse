import { LabelSwitch } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'

import { useNoteModelSingleFieldAtom } from '../data-provider'

export const NoteCombinedSwitch = () => {
  const [isPublished, setIsPublished] =
    useNoteModelSingleFieldAtom('isPublished')

  const [allowComment, setAllowComment] =
    useNoteModelSingleFieldAtom('allowComment')

  const [hasMemory, setHasMemory] = useNoteModelSingleFieldAtom('hasMemory')

  const t = useI18n()
  return (
    <>
      <LabelSwitch
        className="flex-shrink-0"
        checked={isPublished}
        onCheckedChange={setIsPublished}
      >
        <span>{t('common.should-published')}</span>
      </LabelSwitch>

      <LabelSwitch
        className="flex-shrink-0"
        checked={allowComment}
        onCheckedChange={setAllowComment}
      >
        <span>{t('common.allow-comment')}</span>
      </LabelSwitch>

      <LabelSwitch
        className="flex-shrink-0"
        checked={hasMemory}
        onCheckedChange={setHasMemory}
      >
        <span>{t('module.notes.mark_as_memory')}</span>
      </LabelSwitch>
    </>
  )
}
