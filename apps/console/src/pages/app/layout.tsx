import { Outlet } from 'react-router-dom'

import { SeoObserver } from '~/components/common/SeoObserver'
import { LayoutHeader } from '~/components/layout/header'
import { useBeforeMounted } from '~/hooks/use-before-mounted'

export default function Layout() {
  useBeforeMounted(() => {
    if (location.pathname === '/') {
      window.location.href = '/dashboard'
    }
  })

  return (
    <>
      <LayoutHeader />
      <main className="mt-28 p-4">
        <Outlet />
      </main>
      <SeoObserver />
    </>
  )
}
