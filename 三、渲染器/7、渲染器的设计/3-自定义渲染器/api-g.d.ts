import type { RendererElement, RendererNode, VNode } from 'vue'
import type {
  VNodeChildAtomC1,
  VNodeNormalizedChildrenC,
  VNodeNormalizedChildrenC1
} from '#shims'

declare global {
  interface Element {
    [key: string]: unknown
    vnode?: VVNode<Node, Element> | null
  }

  interface Window {
    name?: string
  }

  // interface VVNode 1<
  //   HN = RendererNode,
  //   HE = RendererElement,
  //   EP = { [key: string]: any }
  // > extends VNodeChildAtomC 1<HN, HE, EP> {}

  interface VVNode<
    HN = RendererNode,
    HE = RendererElement,
    EP = { [key: string]: any }
  > extends VNode<HN, HE, EP> {
    children?:
      | VNodeNormalizedChildrenC<HN, HE, EP>
      | VNodeNormalizedChildrenC1<HN, HE, EP>
  }

  interface IsArrayTypeFixed<F> {
    (v: F): v is F extends Array<infer T> ? T[] : any[]
  }
}
