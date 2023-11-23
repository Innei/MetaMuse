import { LabelSwitch } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'

import { usePageModelSingleFieldAtom } from '../data-provider'

export const PageCombinedSwitch = () => {
  const [allowComment, setAllowComment] =
    usePageModelSingleFieldAtom('allowComment')

  const t = useI18n()
  return (
    <>
      <LabelSwitch checked={allowComment} onCheckedChange={setAllowComment}>
        <span>{t('common.allow-comment')}</span>
      </LabelSwitch>
    </>
  )
}
