import { useState } from 'react'
import type { FC } from 'react'

import { PresentDrawer } from '~/components/ui/drawer'
import { FABPortable } from '~/components/ui/fab/FabContainer'

export const PresentComponentFab: FC<{
  Component: FC
}> = ({ Component }) => {
  const [drawerShown, setDrawerShown] = useState(false)
  return (
    <PresentDrawer content={Component}>
      <FABPortable
        onlyShowInMobile
        onClick={() => {
          setDrawerShown(!drawerShown)
        }}
      >
        <i className="icon-[mingcute--settings-6-line]" />
      </FABPortable>
    </PresentDrawer>
  )
}
