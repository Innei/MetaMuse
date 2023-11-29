import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Reorder } from 'framer-motion'
import { toast } from 'sonner'
import type { FC } from 'react'

import { useIsMobile } from '~/atoms'
import { DeleteConfirmButton } from '~/components/biz/special-button/DeleteConfirmButton'
import { PageError } from '~/components/common/PageError'
import { PageLoading } from '~/components/common/PageLoading'
import { AddCircleLine } from '~/components/icons'
import { TitleExtra } from '~/components/modules/writing/TitleExtra'
import { Button, RelativeTime } from '~/components/ui'
import { useI18n } from '~/i18n/hooks'
import { routeBuilder, Routes } from '~/lib/route-builder'
import { trpc } from '~/lib/trpc'
import { router } from '~/router'

export default (function Page() {
  const nav = useNavigate()

  const t = useI18n()

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

      <DndContent />
    </div>
  )
})

const DndContent = () => {
  const { data, isLoading, isError } = trpc.page.all.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnMount: true,
  })

  const [dndItems, setDndItems] = useState(data)
  useEffect(() => {
    setDndItems(data)
  }, [data])

  const t = useI18n()

  const { mutateAsync: reorderMutation } = trpc.page.reorder.useMutation()
  const utils = trpc.useUtils()

  const reorder = (order: NonNullable<typeof data>) => {
    const currentOrder = data?.map((item) => item.id)
    const reorderOrder = order.map((item) => item.id)
    if (currentOrder?.toString() === reorderOrder?.toString()) return
    setDndItems(order)
    reorderMutation(
      order.map((item, i) => ({ id: item.id, order: order.length - i })),
    )
      .then(() => {
        utils.page.all.invalidate()
      })
      .catch(() => {
        setDndItems(data)
        toast.error(t('module.pages.dnd_failed'))
      })
  }

  const isMobile = useIsMobile()
  if (isLoading || !dndItems) return <PageLoading />
  if (isError) return <PageError />

  return (
    <Reorder.Group
      onReorder={reorder}
      values={dndItems!}
      className="gap-4 grid phone:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 children:flex children:flex-1"
    >
      {dndItems?.map((item) => {
        return (
          <Reorder.Item
            drag={!isMobile}
            key={item.id}
            value={item}
            className="flex border flex-col gap-3 aspect-[2/1] bg-background"
          >
            <div className="justify-between flex relative items-center p-2">
              <div className="rounded-sm font-medium flex-shrink w-0 flex-grow text-lg">
                <TitleExtra className="!w-auto flex-grow" data={item} />
              </div>
              <span className="text-sm flex-shrink-0 opacity-80">
                <RelativeTime time={item.created} />
              </span>
            </div>

            <div className="text-sm gap-3 flex flex-col px-2 flex-grow">
              <div>{item.subtitle}</div>
              <div className="opacity-70">/{item.slug}</div>
            </div>
            <div className="[&_*]:!text-sm justify-end flex py-1 bg-foreground-50">
              <Actions data={item} />
            </div>
          </Reorder.Item>
        )
      })}
    </Reorder.Group>
  )
}

const Actions: FC<{
  data: Omit<StringifyNestedDates<NormalizedPageModel>, 'meta' | 'images'>
}> = ({ data }) => {
  const { mutateAsync: deleteById } = trpc.page.delete.useMutation()
  const utils = trpc.useUtils()
  const t = useI18n()
  return (
    <div className="flex items-center space-x-2">
      <DeleteConfirmButton
        deleteItemText={data.title}
        onDelete={() =>
          deleteById({
            id: data.id,
          }).then(() => {
            utils.page.invalidate()
          })
        }
      />
      <Button
        onClick={() => {
          router.navigate(
            routeBuilder(Routes.PageEditOrNew, {
              id: data.id,
            }),
          )
        }}
        color="primary"
        variant="text"
      >
        {t('common.edit')}
      </Button>
    </div>
  )
}
