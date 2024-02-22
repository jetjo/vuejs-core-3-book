import type { Component, VNodeTypes } from 'vue'

declare global {
  interface VComponent<HN = Node, HE = Element, EP = { [key: string]: any }>
    extends VVNode<HN, HE, EP> {
    type: Component
  }
}
