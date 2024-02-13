import type { RendererConfig } from '#shims'
import type { VNode, VNodeArrayChildren } from 'vue'

interface Renderer<
  HN = Node,
  Ele extends HN = Element,
  EP = { [key: string]: any }
> {
  render: (
    vnode: VVNode<HN, Ele, EP> | null,
    container: Ele | null | undefined
  ) => void
  hydrate: (vnode: any, container: any) => void
}

interface RendererCreatorFactoryConfig<
  HN = Node,
  Ele extends HN = Element,
  EP = { [key: string]: any }
> extends Renderer<HN, Ele, EP> {
  mountChildren?: (
    children: VVNode<HN, Ele, EP>['children'],
    container: Ele
  ) => void
  mountProps?: (props: VVNode<HN, Ele, EP>['props'], container: Ele) => void
  mountElement?: (vnode: VVNode<HN, Ele, EP>, container: Ele) => Ele
  patch?: (
    oldVnode: VVNode<HN, Ele, EP> | null,
    vnode: VVNode<HN, Ele, EP>,
    container: Ele
  ) => void
  unmount?: (oldVnode: VVNode<HN, Ele, EP>) => void

  /**@description 只有在合理的上下文中使用才有意义, 例如`mountChildren`方法中 */
  isVNodeArrayChildrenC?: (v: any) => v is VNodeArrayChildrenC<HN, Ele, EP>
  /**@description 只有在合理的上下文中使用才有意义, 例如`mountChildren`方法中 */
  isVNodeChildAtomC_VVNode?: (v: any) => v is VVNode<HN, Ele, EP> //| ((v: any)=> boolean)
}

export type VNodeChildAtomC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VVNode<HN, HE, EP> | string | number | boolean | null | undefined | void

export type VVNodeOptionalSFC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Partial<Omit<VVNode<HN, HE, EP>, 'type' | 'props' | 'children' | 'el'>> &
  Pick<VVNode<HN, HE, EP>, 'type' | 'props' | 'children' | 'el'>

export type VNodeChildAtomC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Omit<VVNodeOptionalSFC<HN, HE, EP>, 'children'> & {
  children?: VNodeNormalizedChildrenC1<HN, HE, EP>
  // | VNodeNormalizedChildrenC<HN, HE, EP>
}

export type VNodeArrayChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC<HN, HE, EP> | VNodeChildAtomC<HN, HE, EP>>

export type VNodeArrayChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC1<HN, HE, EP> | VNodeChildAtomC1<HN, HE, EP>>

export type VNodeChildC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VNodeChildAtomC<HN, HE, EP> | VNodeArrayChildrenC<HN, HE, EP>

export type VNodeNormalizedChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  /* | Exclude<VVNode['children'], VNodeArrayChildren> 
  VVNode['children']的类型就是VNodeNormalizedChildrenC,
  这样就形成循环依赖了!*/
  | Exclude<VNode['children'], VNodeArrayChildren>
  | VNodeArrayChildrenC<HN, HE, EP>

export type VNodeNormalizedChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  | Exclude<VNode['children'], VNodeArrayChildren>
  | VNodeArrayChildrenC1<HN, HE, EP>

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
  VNodeArrayChildrenC,
  VNodeChildC,
  VNodeChildAtomC
}
