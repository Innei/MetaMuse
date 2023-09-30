import { clsxm } from '~/lib/helper'

interface Props {
  loadingText?: string
}

export const PageLoading: Component<Props> = (props) => {
  return (
    <div
      className={clsxm(
        'flex flex-col items-center justify-center mt-[5rem]',
        props.className,
      )}
    >
      <div className="loading loading-dots" />
      <span className="mt-8 text-sm">{props.loadingText || 'Loading...'}</span>
    </div>
  )
}
