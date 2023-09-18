import { useEffect } from 'react'
import { Toaster } from 'sonner'

import { useBeforeMounted } from '~/hooks/use-before-mounted'
import { useTheme } from '~/hooks/use-theme'

export const ColorModeObserver = () => {
  const { actualTheme: theme } = useTheme()
  useBeforeMounted(() => {
    document.documentElement.dataset.theme = theme
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return <Toaster theme={theme} />
}
