import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { watch } from '@vue/runtime-core'
import { useColorMode } from '@vueuse/core'

import { useBeforeMounted } from '~/hooks/use-before-mounted'

const mode = useColorMode()
export const ColorModeObserver = () => {
  useBeforeMounted(() => {
    document.documentElement.dataset.theme = mode.value
  })
  const [_, forceUpdate] = useState(0)
  useEffect(() => {
    return watch(mode, () => {
      document.documentElement.dataset.theme = mode.value
      forceUpdate((v) => v + 1)
    })
  }, [])
  return <Toaster theme={mode.value === 'auto' ? 'system' : mode.value} />
}
