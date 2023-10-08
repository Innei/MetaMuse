import { noop } from 'lodash-es'
import type { FC } from 'react'

import { PresentDrawer } from '~/components/ui/drawer'
import { FABPortable } from '~/components/ui/fab/FabContainer'

export const PresentComponentFab: FC<{
  Component: FC
}> = ({ Component }) => {
  return (
    <PresentDrawer content={Component}>
      <FABPortable onlyShowInMobile onClick={noop}>
        <i className="icon-[mingcute--settings-6-line]" />
      </FABPortable>
    </PresentDrawer>
  )
}
