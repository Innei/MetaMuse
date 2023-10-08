import { useCallback, useMemo } from 'react'
import type { RouteMeta } from './interface'

import { useI18n } from '~/i18n/hooks'

export const useExtractTitle = (maybeTitle: RouteMeta['title'] | undefined) => {
  const t = useI18n()
  return useMemo(
    () => (typeof maybeTitle === 'function' ? maybeTitle(t) : maybeTitle),
    [maybeTitle, t],
  )
}

export const useExtractTitleFunction = () => {
  const t = useI18n()
  return useCallback(
    (maybeTitle: RouteMeta['title'] | undefined) =>
      typeof maybeTitle === 'function' ? maybeTitle(t) : maybeTitle,
    [t],
  )
}
