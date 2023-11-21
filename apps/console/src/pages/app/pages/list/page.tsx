import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { atom } from 'jotai'
import type { FC } from 'react'

import { DeleteConfirmButton } from '~/components/biz/special-button/DeleteConfirmButton'
import { AddCircleLine } from '~/components/icons'
import { Button } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

export default (function Page() {
  const filterAtom = useMemo(() => atom([] as string[]), [])

  const { data, isLoading } = trpc.page.all.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnMount: true,
  })

  const nav = useNavigate()
  const { mutateAsync: batchDelete } = trpc.page.batchDelete.useMutation()
  const utils = trpc.useUtils()
  const t = useI18n()
  const renderCardBody = useCallback(
    (item: StringifyNestedDates<NormalizedPageModel>) => (
      <>
        {/* <p>
          <span>
            位于分类：
            {item.category.name}
          </span>
        </p>
        {item.tags.length ? (
          <p>
            <span>标签：</span>
            {item.tags.map((tag) => tag.name).join(',')}
          </p>
        ) : null}

        <p>{item.summary || RemoveMarkdown(item.text)}</p>
        <p className="flex items-center text-foreground/80">
          <i className="icon-[mingcute--book-6-line]" />
          <span className="ml-1">{item.count.read}</span>
          <span className="w-5" />
          <i className="icon-[mingcute--heart-line] ml-2" />
          <span className="ml-1">{item.count.like}</span>
        </p> */}
      </>
    ),
    [],
  )
  const actionButtonClick = () => {
    nav(
      routeBuilder(Routes.PageEditOrNew, {
        id: '',
      }),
    )
  }
  const hasSelection = false
  return (
    <div>
      <header className="flex justify-end">
        <Button
          onClick={actionButtonClick}
          color={hasSelection ? 'destructive' : 'primary'}
          icon={
            hasSelection ? (
              <i className="icon-[mingcute--delete-2-line]" />
            ) : (
              <AddCircleLine />
            )
          }
        >
          {hasSelection ? t('common.delete') : t('common.new')}
        </Button>
      </header>
    </div>
  )
})

const Actions: FC<{ data: StringifyNestedDates<NormalizedPageModel> }> = ({
  data,
}) => {
  const { mutateAsync: deleteById } = trpc.post.delete.useMutation()
  const utils = trpc.useUtils()
  const t = useI18n()
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => {
          router.navigate(
            routeBuilder(Routes.PostEditOrNew, {
              id: data.id,
            }),
          )
        }}
        color="primary"
        size="xs"
        variant="text"
      >
        {t('common.edit')}
      </Button>
      <DeleteConfirmButton
        deleteItemText={data.title}
        onDelete={() =>
          deleteById({
            id: data.id,
          }).then(() => {
            utils.post.invalidate()
          })
        }
      />
    </div>
  )
}
