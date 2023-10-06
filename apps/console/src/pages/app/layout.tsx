import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'

import { SeoObserver } from '~/components/common/SeoObserver'
import { LayoutHeader } from '~/components/layout/root/header'
import { useBeforeMounted } from '~/hooks/common/use-before-mounted'
import { ModalStackProvider } from '~/providers/modal-stack-provider'

export default function Layout() {
  useBeforeMounted(() => {
    if (location.pathname === '/') {
      window.location.href = '/dashboard'
    }
  })

  return (
    <>
      <LayoutHeader />
      <main className="mt-28 flex min-h-0 flex-grow flex-col p-4">
        <ErrorBoundary fallback={null}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <ModalStackProvider />
      <SeoObserver />
    </>
  )
}
