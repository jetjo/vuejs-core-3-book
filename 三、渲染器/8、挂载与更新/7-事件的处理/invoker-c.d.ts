import type { RendererConfig } from '#shims'

export type PatchEventParams = Parameters<RendererConfig['patchEventProp']>

export interface Invoker {
  (
    el: PatchEventParams[0],
    key: string,
    handler: PatchEventParams[2],
    onAdd: (v: EventListenerOrEventListenerObjectC) => void,
    onRemove: (v: EventListenerOrEventListenerObjectC) => void,
    inheritor?: EventListenerOrEventListenerObjectC
  ): EventListenerOrEventListenerObjectC
  getInvoker: (
    el: PatchEventParams[0],
    key: string
  ) => EventListenerOrEventListenerObjectC | null | undefined
}
