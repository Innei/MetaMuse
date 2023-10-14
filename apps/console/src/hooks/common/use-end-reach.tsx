import { throttle } from 'lodash-es'
import { useEventCallback } from 'usehooks-ts'
import type { RefObject } from 'react'

export const useEndReachHandler = (
  ref: RefObject<HTMLElement>,
  onEndReached?: () => any,
) => {
  return useEventCallback(
    throttle(() => {
      const { scrollHeight, scrollTop, clientHeight } = ref.current!
      // gap 50px
      if (scrollHeight - scrollTop - clientHeight < 50) {
        onEndReached?.()
      }
    }, 30),
  )
}
