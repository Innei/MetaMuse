import { clsxm } from '~/lib/helper'

export const Spinner: Component = ({ className }) => {
  return <div className={clsxm('loading-spinner', className)} />
}
