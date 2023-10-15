import { merge } from 'lodash'

import {
  BizEventDataMap,
  BusinessEvents,
} from '@core/constants/business-event.constant'
import { EventBusEvents } from '@core/constants/event-bus.constant'
import { EventScope } from '@core/constants/event-scope.constant'
import { scheduleManager } from '@core/shared/utils/schedule.util'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

import { AdminEventsGateway } from '../../gateway/admin/event.gateway'
import { BroadcastBaseGateway } from '../../gateway/base.gateway'
import { SystemEventsGateway } from '../../gateway/system/event.gateway'
import { WebEventsGateway } from '../../gateway/web/events.gateway'

export type EventManagerOptions = {
  scope?: EventScope

  nextTick?: boolean
}

export type IEventManagerHandlerDisposer = () => void

@Injectable()
export class EventManagerService implements OnModuleInit {
  private readonly logger: Logger
  private readonly defaultOptions: Required<EventManagerOptions> = {
    scope: EventScope.TO_SYSTEM,
    nextTick: false,
  }

  constructor(
    private readonly webGateway: WebEventsGateway,

    private readonly adminGateway: AdminEventsGateway,
    private readonly systemGateway: SystemEventsGateway,

    private readonly emitter2: EventEmitter2,
  ) {
    this.logger = new Logger(EventManagerService.name)
  }

  onModuleInit() {
    this.listenSystemEvents()
  }

  private mapScopeToInstance: Record<
    EventScope,
    (
      | WebEventsGateway
      | AdminEventsGateway
      | EventEmitter2
      | SystemEventsGateway
    )[]
  > = {
    [EventScope.ALL]: [
      this.webGateway,
      this.adminGateway,
      this.emitter2,
      this.systemGateway,
    ],
    [EventScope.TO_VISITOR]: [this.webGateway],
    [EventScope.TO_ADMIN]: [this.adminGateway],
    [EventScope.TO_SYSTEM]: [this.emitter2, this.systemGateway],
    [EventScope.TO_VISITOR_ADMIN]: [this.webGateway, this.adminGateway],
    [EventScope.TO_SYSTEM_VISITOR]: [
      this.emitter2,
      this.webGateway,
      this.systemGateway,
    ],
    [EventScope.TO_SYSTEM_ADMIN]: [
      this.emitter2,
      this.adminGateway,
      this.systemGateway,
    ],
  }

  #key = 'event-manager'

  emit<T extends BusinessEvents>(
    event: T,
    data?: BizEventDataMap[T],
    options?: EventManagerOptions,
  ): Promise<void>
  emit(
    event: EventBusEvents,
    data?: any,
    options?: EventManagerOptions,
  ): Promise<void>
  async emit(event: string, data: any = null, _options?: EventManagerOptions) {
    const options = merge(
      {},
      this.defaultOptions,
      _options,
    ) as EventManagerOptions
    const {
      scope = this.defaultOptions.scope,
      nextTick = this.defaultOptions.nextTick,
    } = options

    const instances = this.mapScopeToInstance[scope]

    const tasks = Promise.all(
      instances.map((instance) => {
        if (instance instanceof EventEmitter2) {
          const isObjectLike = typeof data === 'object' && data !== null
          const payload = isObjectLike ? data : { data }

          return instance.emit(this.#key, {
            event,
            payload,
          })
        } else if (instance instanceof BroadcastBaseGateway) {
          return instance.broadcast(event as any, data)
        }
      }),
    )

    if (nextTick) {
      scheduleManager.schedule(async () => await tasks)
    } else {
      await tasks
    }
  }

  // TODO 补充类型
  on<T extends BusinessEvents>(
    event: T,
    handler: (data: BizEventDataMap[T]) => void,
    options?: Pick<EventManagerOptions, 'scope'>,
  ): IEventManagerHandlerDisposer
  on(
    event: EventBusEvents,
    handler: (data: any) => void,
    options?: Pick<EventManagerOptions, 'scope'>,
  ): IEventManagerHandlerDisposer

  on(
    event: string,
    handler: (data: any) => void,
  ): IEventManagerHandlerDisposer {
    const handler_ = (payload) => {
      if (payload.event === event) {
        handler(payload.payload)
      }
    }
    const cleaner = this.emitter2.on(this.#key, handler_)

    return () => {
      cleaner.off(this.#key, handler_)
    }
  }

  #handlers: ((type: string, data: any) => void)[] = []

  registerHandler(
    handler: (type: EventBusEvents, data: any) => void,
  ): IEventManagerHandlerDisposer
  registerHandler(
    handler: (type: BusinessEvents, data: any) => void,
  ): IEventManagerHandlerDisposer
  registerHandler(handler: Function) {
    this.#handlers.push(handler as any)
    return () => {
      const index = this.#handlers.findIndex((h) => h === handler)
      this.#handlers.splice(index, 1)
    }
  }

  private listenSystemEvents() {
    this.emitter2.on(this.#key, (data) => {
      const { event, payload } = data
      console.debug(`Received event: [${event}]`, payload)
      // emit current event directly
      this.emitter2.emit(event, payload)
      this.#handlers.forEach((handler) => handler(event, payload))
    })
  }

  /**
   * system event
   */
  event<T extends BusinessEvents>(
    event: T,
    data: BizEventDataMap[T],
  ): IEventManagerHandlerDisposer
  event(event: EventBusEvents, data: any): IEventManagerHandlerDisposer

  event(event: any, data: any): any {
    return this.emit(event, data, {
      scope: EventScope.TO_SYSTEM,
    })
  }

  get broadcast() {
    return this.emit
  }
}
