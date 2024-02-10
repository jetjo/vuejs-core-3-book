type RendererConfig = {
  // 接口Node继承自EventTarget，所以这里的el是Node类型
  createElement: (
    tag: string,
    props?: VNode['props'],
    ...children: VNode[]
  ) => Node

  //   接口Node实现了textContent属性，所以这里的el是Node类型
  /**@description 设置元素的文本节点 */
  setElementText: (el: Node, text: string) => void

  //   接口Node实现了insertBefore方法，所以这里的anchor是Node类型
  /**@description 将`child`插入到`parent.anchor`节点前面 */
  insert: (
    child: Node,
    parent: Node,
    anchor: Node | null,
    isSvg?: boolean
  ) => void

  patchProps: (el: Element, key: string, prevValue: any, nextValue: any) => void

  setAttribute: Element['setAttribute']

  addEventListener: EventTarget['addEventListener']

  querySelector: ParentNode['querySelector']

  get window(): Window
  get document(): Document
  getContainer: (css: string = '#app') => Element
}

interface VNode {
  type: string
  props?: Record<string, any>
  children?: string | VNode[]
  el?: Node | null
  key?: string | number | null
  shapeFlag?: number
}

export type { RendererConfig, VNode }
