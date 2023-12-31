import type { FC, ReactNode } from 'react'

import { clsxm } from '~/lib/helper'

export const EditorLayer: FC<{
  children: ReactNode[]
  mainClassName?: string
}> = (props) => {
  const { children, mainClassName } = props
  const [TitleEl, HeaderEl, ContentEl, FooterEl, ...rest] = children
  return (
    <>
      <div className="flex justify-between flex-wrap items-center mb-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center text-lg font-medium">{TitleEl}</p>
        </div>

        <div className="space-x-2 flex-shrink-0 lg:space-x-4 flex-grow text-right">
          {HeaderEl}
        </div>
      </div>

      <main
        className={clsxm(
          'flex flex-grow lg:grid lg:grid-cols-[auto_400px] lg:gap-4',
          mainClassName,
        )}
      >
        <div className="flex flex-grow flex-col overflow-auto">{ContentEl}</div>

        {FooterEl}
      </main>
      {rest}
    </>
  )
}
