import { Button } from '@nextui-org/react'
import { useContext } from 'react'

import { DeleteConfirmButton } from '~/components/biz/special-button/DeleteConfirmButton'
import {
  CommentStateContext,
  useSetCommentSelectionKeys,
} from '~/components/modules/comments/CommentContext'
import { ReplyModal } from '~/components/modules/comments/ReplyModal'
import { useModalStack } from '~/components/ui/modal/stacked/provider'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'

import { CommentState } from '../../../components/modules/comments/constants'

export const CommentAction = (props: NormalizedComment) => {
  const currentState = useContext(CommentStateContext)
  const t = useI18n()
  const { id } = props

  const utils = trpc.useUtils()
  const { mutateAsync: updateState } = trpc.comment.changeState.useMutation({
    async onSuccess() {
      utils.comment.list.invalidate()
    },
  })
  const setSelectionKeys = useSetCommentSelectionKeys()

  const { mutateAsync: deleteComment } = trpc.comment.deleteComment.useMutation(
    {
      onMutate({ id }) {
        setSelectionKeys((s) => {
          const oSize = s.size
          s.delete(id)
          if (s.size === oSize) return s
          return new Set(s)
        })
      },
      async onSuccess() {
        utils.comment.list.invalidate()
      },
    },
  )

  const { present } = useModalStack()

  return (
    <div className="flex space-x-4 items-center justify-end lg:justify-start">
      {currentState === CommentState.UNREAD && (
        <Button
          size="sm"
          variant="light"
          color="primary"
          onClick={() => {
            updateState({
              id,
              state: CommentState.READ,
            })
          }}
        >
          {t('module.comment.read')}
        </Button>
      )}
      <Button
        size="sm"
        variant="light"
        color="secondary"
        onClick={() => {
          present({
            title: `${t('module.comment.reply')} ${props.author}`,
            content: () => <ReplyModal {...props} />,
            clickOutsideToDismiss: false,
          })
        }}
      >
        {t('module.comment.reply')}
      </Button>
      <DeleteConfirmButton
        onDelete={() => {
          return deleteComment({
            id,
          })
        }}
      />
    </div>
  )
}
