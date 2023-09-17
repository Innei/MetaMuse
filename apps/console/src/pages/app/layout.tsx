import { Outlet } from 'react-router-dom'

import { LayoutHeader } from '~/components/layout/header'

export default function Layout() {
  return (
    <>
      <LayoutHeader />
      <Outlet />
    </>
  )
}
