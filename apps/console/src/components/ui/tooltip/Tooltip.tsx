import React, { useCallback } from 'react'
import type { Placement } from '@floating-ui/react-dom'
import type { FC, PropsWithChildren } from 'react'

import { FloatPopover } from '../float-popover'

export const Tooltip: FC<
  PropsWithChildren & {
    tip: React.ReactNode
    placement?: Placement
  }
> = ({ children, tip, placement }) => {
  return (
    <FloatPopover
      placement={placement || 'bottom'}
      type="tooltip"
      TriggerComponent={useCallback(
        () => (
          <>{children}</>
        ),
        [children],
      )}
    >
      {tip}
    </FloatPopover>
  )
}
