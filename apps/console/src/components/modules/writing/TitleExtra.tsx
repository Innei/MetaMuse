import { PhEyeSlash } from '~/components/icons'
import { MotionButtonBase } from '~/components/ui/button'
import { trpc } from '~/lib/trpc'

type RequiredField = { id: string; title: string }
type OptionalField = Partial<{
  isPublished: boolean
}>
export const TitleExtra = <T extends RequiredField & OptionalField>(props: {
  data: T
}) => {
  const { title, id, isPublished } = props.data
  const utils = trpc.useContext()
  return (
    <div className="flex flex-row space-x-2 items-center [&_i]:text-foreground/60 [&_svg]:text-foreground/60">
      <span>{title}</span>
      {!isPublished && <PhEyeSlash />}
      <MotionButtonBase
        onClick={async () => {
          const url = await utils.helpers.urlBuilder.fetch({
            id,
          })

          window.open(url, '_blank')
        }}
      >
        <i className="icon-[mingcute--external-link-line]" />
      </MotionButtonBase>
    </div>
  )
}
