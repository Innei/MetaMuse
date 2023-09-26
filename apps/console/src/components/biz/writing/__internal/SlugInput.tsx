import { Input, Skeleton } from '@nextui-org/react'
import { useEffect, useRef } from 'react'
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

  const [slug, setSlug] = useAtom(useBaseWritingContext().slug!)
  const { data: category } = trpc.category.getCategoryOrDefaultById.useQuery({
    id: categoryId,
  })

  const triggerOnceRef = useRef(false)
  useEffect(() => {
    if (triggerOnceRef.current) return
    if (!categoryId && category) {
      triggerOnceRef.current = true
      setCategoryId(category.id)
    }
  }, [category, categoryId, setCategoryId])

  const isLoading = !urlConfig || !category
  return (
    <div className="my-3 flex items-center pl-2 text-sm text-gray-500">
      {isLoading ? (
        <Skeleton className="h-4 w-[120px]" />
      ) : (
        <label>{`${urlConfig?.webUrl}/${category?.slug}/`}</label>
      )}

      <div className="relative inline-flex min-w-[2rem] items-center [&_*]:leading-4">
        <Input
          size="sm"
          variant="underlined"
          color="primary"
          className="absolute w-full translate-y-[1px]"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
          }}
        />
        <span className="pointer-events-none text-transparent">
          {slug}&nbsp;&nbsp;
        </span>
      </div>
    </div>
  )
}
