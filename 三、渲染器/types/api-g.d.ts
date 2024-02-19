import type { RendererElement, RendererNode, VNode } from 'vue'
import type {
  VNodeChildAtomC1,
  VNodeNormalizedChildrenC,
  VNodeNormalizedChildrenC1,
  VNodeNormalizedChildrenKeyed,
  VNodeNormalizedChildrenKeyedC
} from '#shims'

declare global {
  interface EventTarget {
    _vei?: EventHandlerMap
  }

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

  interface VVNode<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }>
    extends VNode<HN, HE, EP> {
    children?: VNodeNormalizedChildrenC<HN, HE, EP>  // | VNodeNormalizedChildrenC1<HN, HE, EP>
  }

  interface VVNodeWithKeyedChildren<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }>
    extends VNode<HN, HE, EP> {
    children?: VNodeNormalizedChildrenKeyed<HN, HE, EP>
  }

  interface VVNodeWithKeyedChildrenC<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }>
    extends VNode<HN, HE, EP> {
    children?: VNodeNormalizedChildrenKeyedC<HN, HE, EP>
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

  interface AssertUnknownEx {
    <T>(
      value: unknown,
      validate?: ((s: T, ...args: any[]) => boolean) | undefined,
      ...args: any[]
    ): asserts value is T
  }

  interface AssertUnknowns {
    <T>(
      validate?: ((...s: T[]) => boolean) | undefined,
      ...value: unknown[]
    ): asserts value is T[]
  }
}
