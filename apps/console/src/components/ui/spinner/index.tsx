export const Spinner: Component<{
  size?: number
}> = ({ className, size }) => {
  return (
    <div className={className}>
      <div
        className="loading loading-spinner text-primary"
        style={{
          width: size || '3rem',
          height: size || '3rem',
        }}
      />
    </div>
  )
}

export const AbsoluteCenterSpinner = () => {
  return (
    <div className="absolute inset-0 z-[10] flex items-center justify-center">
      <Spinner />
    </div>
  )
}
