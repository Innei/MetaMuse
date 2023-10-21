import { Divider, Spinner } from '@nextui-org/react'
import { isUndefined } from 'lodash-es'

import { Empty } from '~/components/common/Empty'
import { OffsetMainLayout } from '~/components/layout/root/main'
import { clsxm } from '~/lib/helper'

import { CommentAuthorCell } from './CommentAuthorCell'
import { CommentContentCell } from './CommentContentCell'
import { useCommentDataSource } from './CommentContext'

export const CommentMobileList = () => {
  const { isLoading, data } = useCommentDataSource()

  if (isLoading && isUndefined(data)) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!isUndefined(data) && !data.length) {
    return <Empty className="flex-grow" />
  }

  return (
    <OffsetMainLayout className="mt-4 flex-shrink h-0 flex-grow overflow-auto relative">
      {isLoading && (
        <div className="absolute z-[10] inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <ul
        className={clsxm(
          'flex flex-col duration-200',
          isLoading && 'opacity-80',
        )}
      >
        {data?.map((item, i) => {
          return (
            <li key={item.id} className="flex flex-col gap-2">
              <CommentAuthorCell {...item} />
              <CommentContentCell {...item} />

              {i !== data.length - 1 && <Divider className="mt-4 mb-8" />}
            </li>
          )
        })}
      </ul>
    </OffsetMainLayout>
  )
}
