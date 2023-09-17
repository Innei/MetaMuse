import { clsxm } from '~/lib/helper'

interface Props {
  errorText?: string
}

export const Error: Component<Props> = (props) => {
  return (
    <div
      className={clsxm(
        'flex flex-col items-center justify-center',
        props.className,
      )}
    >
      <i className="icon-[mingcute--close-line] text-3xl text-red-500" />
      <span className="mt-8 text-sm">
        {props.errorText || 'Has some error...'}
      </span>
    </div>
  )
}

export { Error as ErrorComponent }
