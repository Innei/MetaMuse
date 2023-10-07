import type { FC, ReactNode } from 'react'

export const EditorLayer: FC<{
  children: ReactNode[]
}> = (props) => {
  const { children } = props
  const [TitleEl, HeaderEl, ContentEl, FooterEl] = children
  return (
    <>
      <div className="flex justify-between">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center text-lg font-medium">{TitleEl}</p>
        </div>

        {HeaderEl}
      </div>

      <div className="flex flex-grow lg:grid lg:grid-cols-[auto_400px] lg:gap-4">
        <div className="flex flex-grow flex-col overflow-auto">{ContentEl}</div>

        {FooterEl}
      </div>
    </>
  )
}
