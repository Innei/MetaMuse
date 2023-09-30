import type { ErrorCodeEnum } from '@constants'
import type { AxiosError } from 'axios'

export class BizError extends Error {
  constructor(
    public readonly code: ErrorCodeEnum,
    public readonly message: string,

    public readonly status: number,
    public readonly raw: AxiosError,
  ) {
    super()
  }
}
