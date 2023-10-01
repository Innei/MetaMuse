import { useState } from 'react'

import { PresentDrawer } from '~/components/ui/drawer'
import { FABPortable } from '~/components/ui/fab/FabContainer'

import { SidebarWrapper } from '../../writing/sidebar'
import { CategorySelector } from './CategorySelector'
import { CustomCreatedInput } from './CustomCreatedInput'
import { PostCombinedSwitch } from './PostCombinedSwitch'
import { RelatedPostSelector } from './RelatedPostSelector'
import { SummaryInput } from './SummaryInput'
import { TagsInput } from './TagsInput'

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <CategorySelector />
      <TagsInput />
      <RelatedPostSelector />
      <SummaryInput />
      <PostCombinedSwitch />
      <CustomCreatedInput />
    </SidebarWrapper>
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
