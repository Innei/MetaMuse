import { useSearchParams } from 'react-router-dom'

import { Button } from '~/components/ui/button'
import { FloatPopover } from '~/components/ui/float-popover'
import { useModalStack } from '~/components/ui/modal/stacked/provider'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import {
  useCommentSelectionKeys,
  useSetCommentSelectionKeys,
} from './CommentContext'
import { CommentState } from './constants'

export const CommentBatchActionGroup = () => {
  const selectionKeys = useCommentSelectionKeys()
  const setSelectionKeys = useSetCommentSelectionKeys()
  const utils = trpc.useUtils()
  const { mutateAsync: batchChangeState } =
    trpc.comment.batchChangeState.useMutation({
      onMutate() {
        setSelectionKeys(new Set())
      },
      onSuccess() {
        utils.comment.list.invalidate()
      },
    })
  const { mutateAsync: batchDelete } = trpc.comment.batchDelete.useMutation({
    onMutate() {
      setSelectionKeys(new Set())
    },
    onSuccess() {
      utils.comment.list.invalidate()
    },
  })
  const [search] = useSearchParams()
  const tab = search.get('tab') as CommentState

  const { present } = useModalStack()
  const t = useI18n()
  if (!tab) return null

  if (!selectionKeys.size) return null
  return (
    <div className="absolute top-0 right-0 hidden lg:flex gap-4">
      {tab !== CommentState.READ && (
        <FloatPopover
          type="tooltip"
          placement="bottom"
          TriggerComponent={() => (
            <Button
              onClick={() => {
                batchChangeState({
                  ids: Array.from(selectionKeys),
                  state: CommentState.READ,
                })
              }}
              color="primary"
              variant="default"
            >
              <i className="icon-[mingcute--check-fill]" />
            </Button>
          )}
        >
          {t('module.comment.read')}
        </FloatPopover>
      )}

      <FloatPopover
        type="tooltip"
        placement="bottom"
        TriggerComponent={() => (
          <Button
            iconOnly
            rounded
            onClick={() => {
              batchChangeState({
                ids: Array.from(selectionKeys),
                state: CommentState.SPAM,
              })
            }}
          >
            <i className="icon-[mingcute--delete-2-line]" />
          </Button>
        )}
      >
        {t('module.comment.spam')}
      </FloatPopover>

      <FloatPopover
        type="tooltip"
        placement="bottom"
        TriggerComponent={() => (
          <Button
            rounded
            color="destructive"
            iconOnly
            onClick={() => {
              present({
                title: t('common.confirm-delete-items', {
                  count: selectionKeys.size,
                }),
                content: ({ dismiss }) => {
                  return (
                    <div className="w-[400px] text-right">
                      <Button
                        color="destructive"
                        onClick={() => {
                          batchDelete({
                            ids: Array.from(selectionKeys),
                          })
                          dismiss()
                        }}
                      >
                        {t('common.confirm')}
                      </Button>
                    </div>
                  )
                },
              })
            }}
          >
            <i className="icon-[mingcute--close-line]" />
          </Button>
        )}
      >
        {t('common.delete')}
      </FloatPopover>
    </div>
  )
}
