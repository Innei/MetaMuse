import { Button, Textarea } from '@nextui-org/react'
import markdownEscape from 'markdown-escape'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'

import { MotionButtonBase } from '~/components/ui/button'
import { FloatPopover } from '~/components/ui/float-popover'
import { ScrollArea } from '~/components/ui/scroll-area'
import { KAOMOJI_LIST } from '~/constants/kaomoji'
import { useUncontrolledInput } from '~/hooks/common/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'
import { $axios } from '~/lib/request'
import { trpc } from '~/lib/trpc'
import { useCurrentModal } from '~/providers/modal-stack-provider'

export const ReplyModal = (props: NormalizedComment) => {
  const { author, id, text } = props
  const t = useI18n()
  const [, getValue, ref] = useUncontrolledInput()
  const handleSubmit = useEventCallback((e: any) => {
    e.preventDefault()
  })

  const { dismiss, ref: modalElRef } = useCurrentModal()
  const utils = trpc.useUtils()
  const handleReply = useEventCallback(async () => {
    const text = getValue()
    if (!text) {
      toast.error(t('module.comment.reply-empty'))
      return
    }

    await $axios.post(`/comments/master/reply/${id}`, {
      text,
    })
    toast.success(t('module.comment.reply-success'))
    utils.comment.list.invalidate()
    dismiss()
  })
  return (
    <form
      className="flex flex-col w-[500px] max-w-full"
      onSubmit={handleSubmit}
    >
      <div>{author} 说：</div>
      <Textarea
        className="[&_*]:!cursor-not-allowed"
        size="lg"
        variant="faded"
        readOnly
        value={text}
      />
      <div className="mt-4">回复内容：</div>
      <Textarea size="lg" maxRows={5} ref={ref} />

      <div className="flex justify-between mt-4 gap-2">
        <FloatPopover
          trigger="click"
          to={modalElRef.current!}
          TriggerComponent={() => (
            <MotionButtonBase>
              <i className="icon-[mingcute--emoji-line]" />
            </MotionButtonBase>
          )}
        >
          <ScrollArea.Root className="w-[400px] h-[200px] pointer-events-auto overflow-scroll">
            <ScrollArea.Viewport>
              <div className="grid grid-cols-4 gap-4">
                {KAOMOJI_LIST.map((kamoji) => {
                  return (
                    <MotionButtonBase
                      key={kamoji}
                      onClick={() => {
                        const $ta = ref.current!
                        $ta.focus()

                        requestAnimationFrame(() => {
                          const start = $ta.selectionStart as number
                          const end = $ta.selectionEnd as number
                          const escapeKaomoji = markdownEscape(kamoji)
                          $ta.value = `${$ta.value.substring(
                            0,
                            start,
                          )} ${escapeKaomoji} ${$ta.value.substring(
                            end,
                            $ta.value.length,
                          )}`

                          requestAnimationFrame(() => {
                            const shouldMoveToPos =
                              start + escapeKaomoji.length + 2
                            $ta.selectionStart = shouldMoveToPos
                            $ta.selectionEnd = shouldMoveToPos

                            $ta.focus()
                          })
                        })
                      }}
                    >
                      {kamoji}
                    </MotionButtonBase>
                  )
                })}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar />
          </ScrollArea.Root>
        </FloatPopover>

        <Button
          variant="solid"
          color="primary"
          size="sm"
          onClick={handleReply}
          type="submit"
        >
          {t('common.submit')}
        </Button>
      </div>
    </form>
  )
}
