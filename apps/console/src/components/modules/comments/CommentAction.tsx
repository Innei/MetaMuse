import { Button } from '@nextui-org/react'
import { useContext } from 'react'

import { CommentStateContext } from '~/components/modules/comments/CommentContext'
import { ReplyModal } from '~/components/modules/comments/ReplyModal'
import { DeleteConfirmButton } from '~/components/ui/button/DeleteConfirmButton'
import { useI18n } from '~/i18n/hooks'
import { trpc } from '~/lib/trpc'
import { useModalStack } from '~/providers/modal-stack-provider'

import { CommentState } from '../../../components/modules/comments/constants'

export const CommentAction = (props: NormalizedComment) => {
  const currentState = useContext(CommentStateContext)
  const t = useI18n()
  const { id } = props

  const utils = trpc.useUtils()
  const { mutateAsync: updateState } = trpc.comment.changeState.useMutation({
    async onSuccess() {
      utils.comment.invalidate()
    },
  })
  const { mutateAsync: deleteComment } =
    trpc.comment.deleteComment.useMutation()

  const { present } = useModalStack()

  return (
    <div className="flex space-x-4 items-center">
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
