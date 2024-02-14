interface EventHandlerMap {
  /**@description `key`是以`on`开头的, 而`addEventListener`的第一个参数`type`不是 */
  [key: string]: EventListenerOrEventListenerObjectC | null | undefined
}

type EventCb = Parameters<EventTarget['addEventListener']>['1']

interface EventListenerC extends EventListener {
  value: EventCb[] | EventCb
}

interface EventListenerObjectC extends EventListenerObject {
  value: EventCb[] | EventCb
}

type EventListenerOrEventListenerObjectC = (EventListenerC | EventListenerObjectC ) & {
  update: (handler: EventCb[] | EventCb) => void
  remove: () => void
}
