import type { RendererConfig } from '#shims'
import type { VNodeArrayChildren } from 'vue'

interface Renderer<
  HN = Node,
  Ele extends HN = Element,
  EP = { [key: string]: any }
> {
  render: (vnode: VVNode<HN, Ele, EP> | null, container: Ele | null) => void
  hydrate: (vnode: any, container: any) => void
}

interface RendererCreatorFactoryConfig<
  HN = Node,
  Ele extends HN = Element,
  EP = { [key: string]: any }
> extends Renderer<HN, Ele, EP> {
  mountChildren: (
    children: VNodeNormalizedChildrenC<HN, Ele, EP>,
    container: Ele
  ) => void
  mountProps: (props: VVNode<HN, Ele, EP>['props'], container: Ele) => void
  mountElement: (vnode: VVNode<HN, Ele, EP>, container: Ele) => void
  patch: (
    oldVnode: VVNode<HN, Ele, EP> | null,
    vnode: VVNode<HN, Ele, EP>,
    container: Ele
  ) => void
  unmount: (oldVnode: VVNode<HN, Ele, EP>) => void
}

type VNodeChildAtomC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VVNode<HN, HE, EP> | string | number | boolean | null | undefined | void
export type VNodeArrayChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC<HN, HE, EP> | VNodeChildAtomC<HN, HE, EP>>
export type VNodeChildC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VNodeChildAtomC<HN, HE, EP> | VNodeArrayChildrenC<HN, HE, EP>

type VNodeNormalizedChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  | Exclude<VVNode['children'], VNodeArrayChildren>
  | VNodeArrayChildrenC<HN, HE, EP>

interface RendererCreatorFactory<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  EP = { [key: string]: any }
> {
  (
    config: RendererCreatorFactoryConfig<HN, Ele, EP>
  ): (
    option: RendererConfig<ET, HN, Ele, ParentN, EleNS, Doc>
  ) => Renderer<HN, Ele, EP>
}

export type {
  RendererCreatorFactoryConfig,
  RendererCreatorFactory,
  Renderer,
  VNodeNormalizedChildrenC,
  VNodeChildC
}
