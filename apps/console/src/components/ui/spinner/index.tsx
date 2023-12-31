import { forwardRef } from 'react'

export const Spinner = forwardRef<
  HTMLDivElement,
  {
    size?: number
    className?: string
  }
>(({ className, size }, ref) => {
  return (
    <div className={className} ref={ref}>
      <div
        className="loading loading-dots"
        style={{
          width: size || '2rem',
          height: size || '2rem',
        }}
      />
    </div>
  )
})

Spinner.displayName = 'Spinner'

export const AbsoluteCenterSpinner: Component = ({ children }) => {
  return (
    <div className="absolute inset-0 z-[10] flex items-center justify-center flex-col gap-6">
      <Spinner />
      {children}
    </div>
  )
}
