import { useEffect, useMemo, useState } from 'react'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const themeAtom = atomWithStorage<AppTheme>('theme', 'system')
type AppTheme = 'dark' | 'light' | 'system'

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom)
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const [systemTheme, setSystemTheme] = useState<Exclude<AppTheme, 'system'>>(
    () => (mediaQuery.matches ? 'dark' : 'light'),
  )

  const updateActualTheme = () => {
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
  }

  useEffect(() => {
    updateActualTheme()

    mediaQuery.addListener(updateActualTheme)

    return () => {
      mediaQuery.removeListener(updateActualTheme)
    }
  }, [])

  // 当 theme 变化时，更新 actualTheme
  useEffect(() => {
    if (theme === 'system') {
      updateActualTheme()
    } else {
      setSystemTheme(theme)
    }
  }, [theme])

  return {
    theme,
    actualTheme: useMemo(() => {
      if (theme === 'system') {
        return systemTheme
      }
      return theme
    }, [systemTheme, theme]),
    setTheme,
  }
}
