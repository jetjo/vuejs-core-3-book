import type { DOMWindow } from 'jsdom'
import type { Invoker } from '#shims'

interface RendererConfig<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  EleNameMapNS = HTMLElementTagNameMap,
  HWC = HostWindowC
> {
  // 接口Node继承自EventTarget，所以这里的el是Node类型
  /**@version 8.1 */
  createElement: {
    <K extends keyof EleNameMapNS>(tag: K): EleNameMapNS[K]
    // NOTE: 类型宽松的重载应该放在最后
    (tag: string): EleNS
    // <K extends keyof EleNameMapNS>(tag: K | string): EleNS | EleNameMapNS[K]
  }

  //   接口Node实现了textContent属性，所以这里的el是Node类型
  /**
   * @version 8.1
   * @description 设置元素的文本节点 */
  setElementText: (el: HN, text: string) => HN

  //   接口Node实现了insertBefore方法，所以这里的anchor是Node类型
  /**
   * @version 8.1
   * @param {HN | null} anchor 用于支持元素的移动
   * @description 将`child`插入到`parent.anchor`节点前面 */
  insert: (child: HN | null, parent: HN, anchor?: HN | null, isSvg?: boolean) => void

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

  /**@version 8.10 */
  createText: (text: string) => HN

  /**
   * @version 8.10
   * @description 在DOM平台,通过Node.nodeValue赋值实现,
   * 对于`CDATASection`、`Comment`、`Text`、`Attribute`节点, `nodeValue`用于设置或获取节点的内容,
   * 对于其他类型的节点, `nodeValue`返回`null`, 设置其他值无效
   * */
  setText: (node: HN, text: string) => HN

  /**@version 8.10 */
  createComment: (text: string) => HN

  /**@version 8.10 */
  setComment: (el: HN, text: string) => HN
}

type Handler = EventListenerOrEventListenerObjectC['value']

type HostWindowC = Window | JSDOMWindow | typeof globalThis

type OnParams<ET> = Parameters<ET['addEventListener']>

interface JSDOMWindow extends DOMWindow {
  name?: string
}

interface RendererConfigCreatorBase<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  EleNameMapNS = HTMLElementTagNameMap,
  HWC = HostWindowC
> {
  // (arg0: { window?: HostWindowC }): RendererConfig
  (
    isBrowser?: boolean
  ): Promise<RendererConfig<ET, HN, Ele, ParentN, EleNS, Doc, EleNameMapNS, HWC>>
}

interface RendererConfigCreator<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  EleNameMapNS = HTMLElementTagNameMap,
  HWC = HostWindowC
> extends RendererConfigCreatorBase<ET, HN, Ele, ParentN, EleNS, Doc, EleNameMapNS, HWC> {
  version: string
  defVNode: VVNode<HN, Ele> //, { [key: string]: any }>
}

export type { RendererConfig, JSDOMWindow, RendererConfigCreator, RendererConfigCreatorBase }
