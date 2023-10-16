import { tRpc } from '@core/processors/trpc/trpc.instance'
import { Injectable } from '@nestjs/common'

@Injectable()
export class tRPCService {
  public get t() {
    return tRpc
  }

  public get procedureAuth() {
    return tRpc.procedure
  }
}
