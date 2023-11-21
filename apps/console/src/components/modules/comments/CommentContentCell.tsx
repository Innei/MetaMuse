import { useContext, useMemo } from 'react'

import { CommentDataContext } from '~/components/modules/comments/CommentContext'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { RelativeTime } from '~/components/ui/date-time'

import { CommentAction } from './CommentAction'
import { UrlRender } from './CommentDesktopTable'

export const CommentContentCell = (props: NormalizedComment) => {
  const {
    created,
    refType,
    text,
    id,
    parent: rootComment,
    mentions,
    isWhispers,
  } = props
  const ctx = useContext(CommentDataContext)
  const ref = ctx.refModelMap.get(id)
  const parentComment = ctx.relationCommentMap[mentions[0]] || rootComment

  const TitleEl = useMemo(() => {
    if (!ref) return <span className="text-foreground/60">已删除</span>
    if (refType === 'Recently') return `${ref.text.slice(0, 20)}...`
    return <TitleExtra className="text-primary" data={ref} />
  }, [ref, refType])
  return (
    <div className="flex flex-col gap-2 py-2 text-sm">
      <div className="flex gap-2 text-sm whitespace-nowrap">
        <RelativeTime time={created} /> 于 {TitleEl} {isWhispers && '悄悄说'}
      </div>

      <p className="break-words">{text}</p>

      <div className="relative mt-2 break-words">
        {parentComment && (
          <blockquote className="ml-3 before:content-[''] before:absolute before:left-[3px] before:rounded-lg before:top-0 before:bottom-0 before:bg-primary before:w-[3px] before:h-full pl-3">
            <div>
              <UrlRender
                author={parentComment.author}
                url={parentComment.url}
              />{' '}
              在 <RelativeTime time={parentComment.created} /> 说：
            </div>
            <p className="mt-2">{parentComment.text}</p>
          </blockquote>
        )}
      </div>

      <CommentAction {...props} />
    </div>
  )
}
