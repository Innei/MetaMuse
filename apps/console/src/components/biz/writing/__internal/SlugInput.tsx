import { Skeleton } from '@nextui-org/react'
import { useEffect } from 'react'
import { useAtom } from 'jotai'
import type { UrlDto } from '@core/modules/configs/configs.dto'

import { trpc } from '~/lib/trpc'

import { useBaseWritingContext } from '../provider'

export const SlugInput = () => {
  const { data: urlConfig } = trpc.aggregate.queryConfigByKey.useQuery<UrlDto>({
    key: 'url',
  })

  const [categoryId, setCategoryId] = useAtom(
    useBaseWritingContext().categoryId!,
  )
  const { data: category } = trpc.category.getCategoryOrDefaultById.useQuery({
    id: categoryId,
  })

  useEffect(() => {
    if (!categoryId && category) setCategoryId(category?.id)
  }, [category, categoryId, setCategoryId])

  const isLoading = !urlConfig || !category
  return (
    <div className="my-3 pl-2 text-sm text-gray-500">
      {isLoading ? (
        <Skeleton className="w-[120px]" />
      ) : (
        <label>{`${urlConfig?.webUrl}/${category?.slug}/`}</label>
      )}

      {/* <UnderlineInput
        class="ml-2"
        value={data.slug}
        onChange={(e) => {
          data.slug = e
        }}
      /> */}
    </div>
  )
}
