import { ImageDetailSection } from '../../writing/ImageDetailSection'
import { MetaKeyValueEditSection } from '../../writing/MetaKeyValueEditSection'
import { PresentComponentFab } from '../../writing/PresentComponentFab'
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

      <PresentComponentFab Component={Sidebar} />
    </div>
  )
}
