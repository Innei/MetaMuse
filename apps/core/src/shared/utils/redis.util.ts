import { RedisKeys } from '@core/constants/cache.constant'

export const getRedisKey = <T extends string = RedisKeys | '*'>(
  key: T,
  ...concatKeys: string[]
): `${'meta-muse'}:${T}${string | ''}` => {
  return `${'meta-muse'}:${key}${
    concatKeys && concatKeys.length ? `:${concatKeys.join('_')}` : ''
  }`
}
