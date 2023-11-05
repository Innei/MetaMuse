import { useLayoutEffect } from 'react'

import { useBeforeMounted } from '~/hooks/common/use-before-mounted'
import { useTheme } from '~/hooks/common/use-theme'

export const ColorModeObserver = () => {
  const { actualTheme: theme } = useTheme()
  useBeforeMounted(() => {
    document.documentElement.dataset.theme = theme
  })
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return null
}
