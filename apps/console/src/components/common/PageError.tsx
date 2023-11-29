import { useI18n } from '~/i18n/hooks'
import { clsxm } from '~/lib/helper'

interface Props {
  errorText?: string
}

export const PageError: Component<Props> = (props) => {
  const { className, errorText } = props
  const t = useI18n()
  return (
    <div
      className={clsxm(
        'absolute inset-0 flex flex-col space-y-6 center pointer-events-none',
        className,
      )}
    >
      {CloudError}
      <span>{errorText || t('common.unknown_error')}</span>
    </div>
  )
}

const CloudError = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    className="text-[12rem]"
  >
    <g fill="none" stroke="currentColor" strokeLinejoin="round">
      <path d="M2 14.5A4.5 4.5 0 0 0 6.5 19h12a3.5 3.5 0 0 0 .5-6.965a7 7 0 0 0-13.76-1.857A4.502 4.502 0 0 0 2 14.5Z" />
      <path strokeWidth="1.5" d="M12 15.5h.01v.01H12z" />
      <path strokeLinecap="round" d="M12 12V9" />
    </g>
  </svg>
)
