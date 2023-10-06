import { useState } from 'react'

import { PresentDrawer } from '~/components/ui/drawer'
import { FABPortable } from '~/components/ui/fab/FabContainer'

import { ImageDetailSection } from '../../writing/ImageDetailSection'
import { MetaKeyValueEditSection } from '../../writing/MetaKeyValueEditSection'
import { SidebarWrapper } from '../../writing/SidebarBase'
import { useNoteModelSingleFieldAtom } from '../data-provider'
import { CustomCreatedInput } from './CustomCreatedInput'
import { NoteCombinedSwitch } from './NoteCombinedSwitch'

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <NoteCombinedSwitch />
      <CustomCreatedInput />

      <ImageSection />

      <MetaSection />
    </SidebarWrapper>
  )
}

const ImageSection = () => {
  const [images, setImages] = useNoteModelSingleFieldAtom('images')
  const text = useNoteModelSingleFieldAtom('text')[0]
  return (
    <ImageDetailSection
      images={images}
      onChange={setImages}
      text={text}
      withDivider="both"
    />
  )
}

const MetaSection = () => {
  const [meta, setMeta] = useNoteModelSingleFieldAtom('meta')
  return <MetaKeyValueEditSection keyValue={meta} onChange={setMeta} />
}

export const NoteEditorSidebar = () => {
  return (
    <div className="hidden flex-col lg:flex mt-6">
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
