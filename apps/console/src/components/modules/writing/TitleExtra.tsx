import { PhEyeSlash } from '~/components/icons'

type RequiredField = { id: string; title: string }
type OptionalField = Partial<{
  isPublished: boolean
}>
export const TitleExtra = <T extends RequiredField & OptionalField>(props: {
  data: T
}) => {
  const { title, id, isPublished } = props.data
  return (
    <div className="flex flex-row space-x-2 items-center  [&_svg]:text-foreground/60">
      <span>{title}</span>
      {!isPublished && <PhEyeSlash />}
    </div>
  )
}
