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
    _vei?: EventHandlerMap
  }

  interface Window {
    name?: string
  }

  // interface VVNode 1<
  //   HN = RendererNode,
  //   HE = RendererElement,
  //   EP = { [key: string]: any }
  // > extends VNodeChildAtomC 1<HN, HE, EP> {}

  interface VVNode<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }>
    extends VNode<HN, HE, EP> {
    children?: VNodeNormalizedChildrenC<HN, HE, EP> | VNodeNormalizedChildrenC1<HN, HE, EP>
  }

  interface IsArrayTypeFixed<F> {
    (v: F): v is F extends Array<infer T> ? T[] : any[]
  }

  interface RequireFunction {
    (v: any, msg?: string): asserts v is Function
  }
  interface RequireEventHandler {
    (v: any): asserts v is EventListenerOrEventListenerObjectC
  }

  interface AssertElementNode<HN = Node, Ele extends HN = Element> {
    (el: HN): asserts el is Ele
  }
  interface AssertUnknown {
    <T>(
      value: unknown,
      validate?: ((s: T) => boolean) | undefined,
      flag?: string
    ): asserts value is T
  }
}
