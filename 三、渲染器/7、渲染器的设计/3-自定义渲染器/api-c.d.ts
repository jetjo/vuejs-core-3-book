import type { DOMWindow } from 'jsdom'

type RendererConfig<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  HWC = HostWindowC
> = {
  // 接口Node继承自EventTarget，所以这里的el是Node类型
  createElement: (tag: string) => EleNS

  //   接口Node实现了textContent属性，所以这里的el是Node类型
  /**@description 设置元素的文本节点 */
  setElementText: (el: HN, text: string) => void

  //   接口Node实现了insertBefore方法，所以这里的anchor是Node类型
  /**@description 将`child`插入到`parent.anchor`节点前面 */
  insert: (child: HN, parent: HN, anchor: HN | null, isSvg?: boolean) => void

  patchProps: (el: Ele, key: string, prevValue: any, nextValue: any) => Ele

  setAttribute?: (el: Ele, qualifiedName: string, value: string) => void

  addEventListener?: (
    el: ET,
    event: OnParams<ET>[0],
    handler: OnParams<ET>[1],
    option?: OnParams<ET>[2]
  ) => void

  querySelector?: ParentN['querySelector']

  // get window(): HWC
  // get document(): Doc
  getContainer?: (css: string = '#app') => Ele | null

  requestAnimationFrame: (
    cb?: Parameters<HWC['requestAnimationFrame']>[0],
    timeout?: number
  ) => // | ReturnType<HWC['requestAnimationFrame']>
  Promise<ReturnType<HWC['requestAnimationFrame']>>
}

type HostWindowC = Window | JSDOMWindow | typeof globalThis

type OnParams<ET> = Parameters<ET['addEventListener']>

interface JSDOMWindow extends DOMWindow {
  name?: string
}

interface RendererConfigCreator {
  // (arg0: { window?: HostWindowC }): RendererConfig
  (): RendererConfig
}

export type { RendererConfig, JSDOMWindow, RendererConfigCreator }
