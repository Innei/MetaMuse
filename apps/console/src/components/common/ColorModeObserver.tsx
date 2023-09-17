import { useEffect } from 'react'

import { watch } from '@vue/runtime-core'
import { useColorMode } from '@vueuse/core'

import { useBeforeMounted } from '~/hooks/use-before-mounted'

const mode = useColorMode()
export const ColorModeObserver = () => {
  useBeforeMounted(() => {
    document.documentElement.dataset.theme = mode.value
  })
  useEffect(() => {
    return watch(mode, () => {
      document.documentElement.dataset.theme = mode.value
    })
  }, [])
  return null
}
