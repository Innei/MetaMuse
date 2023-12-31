import { useMemo } from 'react'

import { Button } from '~/components/ui'
import { useTheme } from '~/hooks/common/use-theme'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const currentThemeIcon = useMemo(() => {
    switch (theme) {
      case 'light':
        return <i className="icon-[mingcute--sun-line]" />
      case 'dark':
        return <i className="icon-[mingcute--moon-line]" />
      default:
        return <i className="icon-[mingcute--computer-line]" />
    }
  }, [theme])

  return (
    <Button
      variant="ghost"
      iconOnly
      rounded
      tooltip="Switch Theme"
      onClick={() => {
        switch (theme) {
          case 'light':
            setTheme('dark')
            break
          case 'dark':
            setTheme('system')
            break
          case 'system':
            setTheme('light')
            break
        }
      }}
    >
      {currentThemeIcon}
    </Button>
  )
}
