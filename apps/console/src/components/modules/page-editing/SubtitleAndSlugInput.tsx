import type { UrlDto } from '@core/modules/configs/configs.dto'

import { trpc } from '~/lib/trpc'

import { useBaseWritingAtom } from '../../biz/writing/provider'

export const PageSlugInput = () => {
  const { data: urlConfig } = trpc.aggregate.queryConfigByKey.useQuery<UrlDto>({
    key: 'url',
  })

  const [slug, setSlug] = useBaseWritingAtom('slug')

  const isLoading = !urlConfig

  return (
    <>
      {isLoading ? (
        <div className="h-2 w-[120px] bg-default-200 animate-pulse" />
      ) : (
        <label>{`${urlConfig?.webUrl}/`}</label>
      )}

      <div className="relative ml-1 inline-flex min-w-[2rem] items-center [&_*]:leading-4 rounded-md bg-primary/5">
        <input
          className="input input-xs absolute w-full translate-y-[1px] bg-transparent !outline-none"
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
