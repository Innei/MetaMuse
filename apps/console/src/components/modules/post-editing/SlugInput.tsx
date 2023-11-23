import { useEffect, useRef } from 'react'
import type { UrlDto } from '@core/modules/configs/configs.dto'

import { trpc } from '~/lib/trpc'

import { useBaseWritingAtom } from '../../biz/writing/provider'

export const SlugInput = () => {
  const { data: urlConfig } = trpc.aggregate.queryConfigByKey.useQuery<UrlDto>({
    key: 'url',
  })

  const [categoryId, setCategoryId] = useBaseWritingAtom('categoryId')

  const [slug, setSlug] = useBaseWritingAtom('slug')
  const { data: category } = trpc.category.getCategoryOrDefaultById.useQuery({
    id: categoryId || '',
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
    <>
      {isLoading ? (
        <div className="h-2 w-[120px] bg-default-200 animate-pulse" />
      ) : (
        <label>{`${urlConfig?.webUrl}/posts/${category?.slug}/`}</label>
      )}

      <div className="relative ml-1 inline-flex min-w-[2rem] items-center [&_*]:leading-4 rounded-md py-1 bg-primary/5 dark:bg-primary/20">
        <input
          className="input input-xs absolute w-full translate-y-[1px] bg-transparent !outline-none !border-0"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
          }}
        />
        <span className="pointer-events-none text-transparent">
          {slug}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
      </div>
    </>
  )
}
