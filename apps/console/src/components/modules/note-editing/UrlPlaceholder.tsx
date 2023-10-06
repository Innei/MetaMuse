import type { UrlDto } from '@core/modules/configs/configs.dto'

import { trpc } from '~/lib/trpc'

export const NoteEditorUrlPlaceholder = () => {
  const { data: urlConfig } = trpc.aggregate.queryConfigByKey.useQuery<UrlDto>({
    key: 'url',
  })
  const { data: latestId } = trpc.note.getLatestId.useQuery()

  return (
    <label>{`${urlConfig?.webUrl}/notes/${
      latestId ? latestId + 1 : ''
    }`}</label>
  )
}
