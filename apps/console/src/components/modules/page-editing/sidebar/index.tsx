import { Input } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'

import { ImageDetailSection } from '../../writing/ImageDetailSection'
import { MetaKeyValueEditSection } from '../../writing/MetaKeyValueEditSection'
import { PresentComponentFab } from '../../writing/PresentComponentFab'
import { SidebarWrapper } from '../../writing/SidebarBase'
import { usePageModelSingleFieldAtom } from '../data-provider'
import { CustomCreatedInput } from './CustomCreatedInput'
import { PageCombinedSwitch } from './PageCombinedSwitch'

const Sidebar = () => {
  return (
    <SidebarWrapper>
      <SubTitleInput />
      <OrderInput />
      <PageCombinedSwitch />
      <CustomCreatedInput />

      <ImageSection />
      <MetaSection />
    </SidebarWrapper>
  )
}

const SubTitleInput = () => {
  const [subtitle, setTitle] = usePageModelSingleFieldAtom('subtitle')
  const t = useI18n()
  return (
    <Input
      label={t('common.subtitle')}
      value={subtitle}
      onChange={(e) => {
        setTitle(e.target.value)
      }}
    />
  )
}

const OrderInput = () => {
  const [order, setValue] = usePageModelSingleFieldAtom('order')
  const t = useI18n()
  return (
    <Input
      label={t('common.order')}
      bindValue={order.toString()}
      type="number"
      onChange={(e) => {
        if (isNaN(+e.target.value)) return
        console.log(+e.target.value)
        setValue(+e.target.value)
      }}
    />
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
