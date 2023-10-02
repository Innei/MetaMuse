import { Divider } from '@nextui-org/react'
import { useState } from 'react'

import { PresentDrawer } from '~/components/ui/drawer'
import { FABPortable } from '~/components/ui/fab/FabContainer'

import { ImageDetailSection } from '../../writing/ImageDetailSection'
import { MetaKeyValueEditSection } from '../../writing/MetaKeyValueEditSection'
import { SidebarWrapper } from '../../writing/SidebarBase'
import { usePostModelSingleFieldAtom } from '../data-provider'
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

      <Divider />
      <PostImageSection />
      <Divider />
      <PostMetaSection />
    </SidebarWrapper>
  )
}

const PostImageSection = () => {
  const [images, setImages] = usePostModelSingleFieldAtom('images')
  const text = usePostModelSingleFieldAtom('text')[0]
  return <ImageDetailSection images={images} onChange={setImages} text={text} />
}

const PostMetaSection = () => {
  const [meta, setMeta] = usePostModelSingleFieldAtom('meta')
  return <MetaKeyValueEditSection keyValue={meta} onChange={setMeta} />
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
