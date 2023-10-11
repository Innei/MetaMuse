import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router-dom'

import { SeoObserver } from '~/components/common/SeoObserver'
import { LayoutHeader } from '~/components/layout/root/header'
import { ComposedKBarProvider } from '~/components/modules/kbar'
import { useBeforeMounted } from '~/hooks/common/use-before-mounted'
import { ModalStackProvider } from '~/providers/modal-stack-provider'
import { router } from '~/router'
import { useCheckAuth } from '~/store/user'

export default function Layout() {
  useBeforeMounted(() => {
    if (location.pathname === '/') {
      window.location.href = '/dashboard'
    }
  })

  const pathname = useLocation().pathname
  const { mutateAsync } = useCheckAuth()
  useEffect(() => {
    mutateAsync().then((ok) => {
      const currentPath = location.pathname + location.search
      const encodedPath = encodeURIComponent(currentPath)
      if (!ok) router.navigate(`/login?to=${encodedPath}`)
    })
  }, [mutateAsync, pathname])

  return (
    <ComposedKBarProvider>
      <LayoutHeader />
      <main className="mt-28 flex min-h-0 flex-grow flex-col p-4">
        <ErrorBoundary fallback={null}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <ModalStackProvider />
      <SeoObserver />
    </ComposedKBarProvider>
  )
}
