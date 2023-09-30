import { Switch } from '@nextui-org/react'

import { useI18n } from '~/i18n/hooks'

import { usePostModelSingleFieldAtom } from '../data-provider'

export const PostCombinedSwitch = () => {
  const [copyright, setCopyright] = usePostModelSingleFieldAtom('copyright')
  const [pin, setPin] = usePostModelSingleFieldAtom('pin')
  const [isPublished, setIsPublished] =
    usePostModelSingleFieldAtom('isPublished')

  const [allowComment, setAllowComment] =
    usePostModelSingleFieldAtom('allowComment')

  const t = useI18n()
  return (
    <>
      <div className="flex items-center justify-between">
        <span>{t('common.copyright')}</span>
        <Switch
          className="flex-shrink-0"
          size="sm"
          isSelected={copyright}
          onValueChange={setCopyright}
        />
      </div>

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
        <span>{t('common.pin')}</span>
        <Switch
          className="flex-shrink-0"
          size="sm"
          isSelected={pin}
          onValueChange={setPin}
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
