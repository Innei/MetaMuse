import { ImageDetailSection } from '../../writing/ImageDetailSection'
import { MetaKeyValueEditSection } from '../../writing/MetaKeyValueEditSection'
import { PresentComponentFab } from '../../writing/PresentComponentFab'
import { SidebarWrapper } from '../../writing/SidebarBase'
import { usePageModelSingleFieldAtom } from '../data-provider'
import { CustomCreatedInput } from './CustomCreatedInput'
import { PageCombinedSwitch } from './PostCombinedSwitch'

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <PageCombinedSwitch />
      <CustomCreatedInput />

      <ImageSection />
      <MetaSection />
    </SidebarWrapper>
  )
}

const ImageSection = () => {
  const [images, setImages] = usePageModelSingleFieldAtom('images')
  const text = usePageModelSingleFieldAtom('text')[0]
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
  const [meta, setMeta] = usePageModelSingleFieldAtom('meta')
  return <MetaKeyValueEditSection keyValue={meta} onChange={setMeta} />
}

export const PageEditorSidebar = () => {
  return (
    <div className="hidden flex-col lg:flex">
      <Sidebar />

      <PresentComponentFab Component={Sidebar} />
    </div>
  )
}
