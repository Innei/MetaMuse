import { AxiosError } from 'axios'

import { ErrorCodeEnum } from '@core/constants/error-code.constant'

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
