import type { UrlDto } from '@core/modules/configs/configs.dto'

import { trpc } from '~/lib/trpc'

import { useNoteModelDataSelector } from './data-provider'

export const NoteEditorUrlPlaceholder = () => {
  const nid = useNoteModelDataSelector((n) => n?.nid)

  const { data: urlConfig } = trpc.aggregate.queryConfigByKey.useQuery<UrlDto>({
    key: 'url',
  })
  const { data: latestId } = trpc.note.getLatestId.useQuery(undefined, {
    enabled: !!nid,
  })

  return (
    <label>{`${urlConfig?.webUrl}/notes/${
      nid ?? (latestId ? latestId + 1 : '')
    }`}</label>
  )
}
