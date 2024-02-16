import type { DOMWindow } from 'jsdom'
import type { Invoker } from '#shims'

interface RendererConfig<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  HWC = HostWindowC
> {
  // 接口Node继承自EventTarget，所以这里的el是Node类型
  /**@version 8.1 */
  createElement: (tag: string) => EleNS

  //   接口Node实现了textContent属性，所以这里的el是Node类型
  /**
   * @version 8.1
   * @description 设置元素的文本节点 */
  setElementText: (el: HN, text: string) => HN

  //   接口Node实现了insertBefore方法，所以这里的anchor是Node类型
  /**
   * @version 8.1
   * @description 将`child`插入到`parent.anchor`节点前面 */
  insert: (child: HN, parent: HN, anchor: HN | null, isSvg?: boolean) => void

  /**@version 8.7 */
  patchEventProp: (el: HN, key: string, prevValue: Handler, nextValue: Handler) => HN

  /**
   * @version 8.7≥8.4≥8.3
   * @dependencies el.setAttribute
   * @dependencies el.removeAttribute
   * @dependencies el.tagName
   * @dependencies el.className
   */
  patchProps: ((el: Ele, key: string, prevValue: unknown, nextValue: unknown) => Ele) & {
    // requireElement?: AssertElementNode<HN, Ele>
    isElement?: (n: Ele) => boolean
  }

  /**@version 8.1 */
  setAttribute?: (el: Ele, qualifiedName: string, value: string) => Ele

  /**@version 8.1 */
  addEventListener?: (
    el: ET,
    event: OnParams<ET>[0],
    handler: OnParams<ET>[1],
    option?: OnParams<ET>[2]
  ) => ET

  // querySelector?: ParentN['querySelector']
  // get window(): HWC
  // get document(): Doc

  /**@version 8.1 */
  getContainer: (css = '#app', apiVer = '') => Ele

  /**@version 8.1 */
  requestAnimationFrame: (
    cb?: Parameters<HWC['requestAnimationFrame']>[0],
    timeout?: number
  ) => // | ReturnType<HWC['requestAnimationFrame']>
  Promise<ReturnType<HWC['requestAnimationFrame']>>

  version: string

  /**@version 8.8≥8.7 */
  Invoker?: Invoker
}

type Handler = EventListenerOrEventListenerObjectC['value']

type HostWindowC = Window | JSDOMWindow | typeof globalThis

type OnParams<ET> = Parameters<ET['addEventListener']>

interface JSDOMWindow extends DOMWindow {
  name?: string
}

interface RendererConfigCreator {
  // (arg0: { window?: HostWindowC }): RendererConfig
  (): Promise<RendererConfig>
}

export type { RendererConfig, JSDOMWindow, RendererConfigCreator }
