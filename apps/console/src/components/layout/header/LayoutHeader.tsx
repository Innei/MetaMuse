import { BreadcrumbDivider } from '~/components/icons'
import { useAppInitialData } from '~/providers/initial'

export const LayoutHeader = () => {
  const { seo } = useAppInitialData()
  return (
    <header className="border-b-[0.5px] border-zinc-200 bg-white/80 px-6 backdrop-blur">
      <nav className="flex h-16 items-center">
        <div className="flex items-center space-x-3">
          <button className="p-2 text-2xl">𝕄</button>
          <BreadcrumbDivider className={'opacity-20'} />
          <span className="opacity-90">{seo.title}</span>
        </div>

        <HeaderMenu />
      </nav>
      <nav></nav>
    </header>
  )
}

const HeaderMenu = () => {
  return <ul></ul>
}
