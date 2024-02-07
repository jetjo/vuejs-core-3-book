type RendererConfig = {
  // 接口Node继承自EventTarget，所以这里的el是Node类型
  createElement: (tag: string, props: any, ...children: any[]) => Node

  //   接口Node实现了textContent属性，所以这里的el是Node类型
  /**@description 设置元素的文本节点 */
  setElementText: (el: Node, text: string) => void

  //   接口Node实现了insertBefore方法，所以这里的anchor是Node类型
  /**@description 将`child`插入到`parent.anchor`节点前面 */
  insert: (child: Node, parent: Node, anchor: Node, isSvg: boolean) => void

  setElementAttribute: (el: Node, key: string, value: any) => void

  onElementEvent: (el: Node, event: string, handler: EventListener) => void

  get window(): Window
  get document(): Document
  get container(): Element
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
