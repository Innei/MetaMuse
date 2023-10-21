import type { FC, PropsWithChildren } from 'react'

import { clsxm } from '~/lib/helper'

export const MainLayout: FC<PropsWithChildren> = (props) => {
  return (
    <main className="mt-28 flex min-h-0 flex-grow flex-col p-4">
      {props.children}
    </main>
  )
}

export const OffsetMainLayout: Component<PropsWithChildren> = (props) => {
  return (
    <div className={clsxm(props.className, '-ml-4 p-4 w-[calc(100%+2rem)]')}>
      {props.children}
    </div>
  )
}
