import { ErrorCodeEnum } from '@constants'
import { AxiosError } from 'axios'

export class BizError extends Error {
  constructor(
    public readonly code: ErrorCodeEnum,
    public readonly message: string,
    public readonly chMessage: string,
    public readonly status: number,
    public readonly raw: AxiosError,
  ) {
    super()
  }
}
