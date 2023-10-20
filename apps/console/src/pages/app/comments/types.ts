import type { RouterOutputs } from '~/lib/trpc'

export type NormalizedComment = RouterOutputs['comment']['list']['data'][number]
