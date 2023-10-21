import { Toaster } from 'sonner'

import { useIsMobile } from '~/atoms'
import { useTheme } from '~/hooks/common/use-theme'

export const ToasterProvider = () => {
  const { actualTheme: theme } = useTheme()

  return (
    <Toaster
      theme={theme}
      position={useIsMobile() ? 'top-center' : 'bottom-right'}
    />
  )
}
