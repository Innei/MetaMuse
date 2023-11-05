import { AbsoluteCenterSpinner } from '../ui'

interface Props {
  loadingText?: string
}

export const PageLoading: Component<Props> = (props) => {
  return <AbsoluteCenterSpinner />
}
