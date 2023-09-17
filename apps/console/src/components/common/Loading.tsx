import { clsxm } from '~/utils/helper'

interface Props {
  loadingText?: string
}

export const Loading: Component<Props> = (props) => {
  return (
    <div
      className={clsxm(
        'flex flex-col items-center justify-center',
        props.className,
      )}
    >
      <div className="loading loading-dots"></div>
      <span className="mt-8 text-sm">{props.loadingText || 'Loading...'}</span>
    </div>
  )
}
