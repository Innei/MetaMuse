import { Outlet } from 'react-router-dom'

import { SeoObserver } from '~/components/common/SeoObserver'
import { LayoutHeader } from '~/components/layout/header'

export default function Layout() {
  return (
    <>
      <LayoutHeader />
      <Outlet />
      <SeoObserver />
    </>
  )
}
