import { TRPC_ROUTER } from '@core/constants/system.constant'

export const TRPCRouter = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(TRPC_ROUTER, true, target)
  }
}
