import { SidebarDateInputField } from '../../writing/SidebarDateInputField'
import { usePageModelSingleFieldAtom } from '../data-provider'

export const CustomCreatedInput = () => {
  return (
    <SidebarDateInputField getSet={usePageModelSingleFieldAtom('created')} />
  )
}
