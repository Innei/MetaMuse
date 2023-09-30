import { ErrorCode, ErrorCodeEnum } from '@core/constants/error-code.constant'
import { HttpException } from '@nestjs/common'

export class BizException extends HttpException {
  constructor(public code: ErrorCodeEnum) {
    const [message, status] = ErrorCode[code]
    super(HttpException.createBody({ code, message }), status)
  }
}
