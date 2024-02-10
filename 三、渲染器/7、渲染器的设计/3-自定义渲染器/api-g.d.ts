import type { RendererElement, RendererNode, VNode } from 'vue'
import type { VNodeArrayChildrenC } from '#shims'

declare global {
  interface Element {
    [key: string]: unknown
    vnode?: VVNode<Node, Element> | null
  }

  interface Window {
    name?: string
  }

  interface VVNode<
    HN = RendererNode,
    HE = RendererElement,
    EP = { [key: string]: any }
  > extends VNode<HN, HE, EP> {
    children: VNodeArrayChildrenC<HN, HE, EP>
  }
}
