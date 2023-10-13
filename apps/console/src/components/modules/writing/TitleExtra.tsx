import { PhEyeSlash } from '~/components/icons'
import { MotionButtonBase } from '~/components/ui/button'
import { EllipsisHorizontalTextWithTooltip } from '~/components/ui/typography'
import { trpc } from '~/lib/trpc'

type RequiredField = { id: string; title: string }
type OptionalField = Partial<{
  isPublished: boolean
  pin: boolean
}>

export const TitleExtra = <T extends RequiredField & OptionalField>(props: {
  data: T
}) => {
  const { title, id, isPublished, pin } = props.data
  const utils = trpc.useContext()
  return (
    <div className="flex w-[300px] relative items-center">
      <div className="flex flex-row space-x-2 items-center [&_i]:text-foreground/60 [&_svg]:text-foreground/60 w-0 flex-grow relative min-w-0">
        {pin && <i className="icon-[mingcute--pin-line] !text-warning" />}
        <div className="relative flex min-w-0 flex-shrink items-center">
          <EllipsisHorizontalTextWithTooltip wrapperClassName="inline-block !w-auto max-w-full">
            {title}
          </EllipsisHorizontalTextWithTooltip>
          <div className="absolute right-[-10px] translate-x-full top-0 bottom-0 items-center flex space-x-2">
            {!isPublished && <PhEyeSlash />}
            <MotionButtonBase
              className="inline-flex items-center"
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
        </div>
      </div>
    </div>
  )
}
