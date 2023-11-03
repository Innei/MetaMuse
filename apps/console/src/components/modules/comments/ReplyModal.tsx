import { Textarea } from '@nextui-org/react'
import markdownEscape from 'markdown-escape'
import { toast } from 'sonner'
import { useEventCallback } from 'usehooks-ts'

import { useIsMobile } from '~/atoms'
import { Button, MotionButtonBase } from '~/components/ui/button'
import { PresentDrawer } from '~/components/ui/drawer'
import { FloatPopover } from '~/components/ui/float-popover'
import { useCurrentModal } from '~/components/ui/modal/stacked/context'
import { ScrollArea } from '~/components/ui/scroll-area'
import { KAOMOJI_LIST } from '~/constants/kaomoji'
import { useUncontrolledInput } from '~/hooks/common/use-uncontrolled-input'
import { useI18n } from '~/i18n/hooks'
import { $axios } from '~/lib/request'
import { trpc } from '~/lib/trpc'

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
    utils.comment.list.refetch()
    dismiss()
  })
  const KaomojiContentEl = (
    <ScrollArea.Root className="w-auto h-[50vh] lg:w-[400px] lg:h-[200px] pointer-events-auto overflow-scroll">
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
                      const shouldMoveToPos = start + escapeKaomoji.length + 2
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
  )
  const KaomojiButton = (
    <MotionButtonBase>
      <i className="icon-[mingcute--emoji-line]" />
    </MotionButtonBase>
  )
  const isMobile = useIsMobile()
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
        {isMobile ? (
          <PresentDrawer content={KaomojiContentEl} zIndex={1002}>
            {KaomojiButton}
          </PresentDrawer>
        ) : (
          <FloatPopover
            trigger="click"
            to={modalElRef.current!}
            TriggerComponent={() => KaomojiButton}
          >
            {KaomojiContentEl}
          </FloatPopover>
        )}

        <Button color="primary" size="sm" onClick={handleReply} type="submit">
          {t('common.submit')}
        </Button>
      </div>
    </form>
  )
}
