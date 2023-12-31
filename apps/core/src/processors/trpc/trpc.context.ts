import { inferAsyncReturnType } from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  return {
    authorization: req.headers.authorization as string | null,
    lang: req.headers['accept-language'],
    ua: req.headers['user-agent'],
  }
}
export type Context = inferAsyncReturnType<typeof createContext>
