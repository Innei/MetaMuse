import { useState } from 'react'

import { PresentDrawer } from '~/components/ui/drawer'
import { FABPortable } from '~/components/ui/fab/FabContainer'

import { CategorySelector } from './CategorySelector'
import { RelatedPostSelector } from './RelatedPostSelector'
import { TagsInput } from './TagsInput'

const Sidebar = () => {
  return (
    <div className="flex flex-col gap-8">
      <CategorySelector />
      <TagsInput />
      <RelatedPostSelector />
    </div>
  )
}

export const PostEditorSidebar = () => {
  return (
    <div className="hidden flex-col lg:flex">
      <Sidebar />

      <Fab />
    </div>
  )
}

const Fab = () => {
  const [drawerShown, setDrawerShown] = useState(false)
  return (
    <PresentDrawer content={Sidebar}>
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
