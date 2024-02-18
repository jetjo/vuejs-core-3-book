import type { RendererConfig } from '#shims'
import type { VNode, VNodeArrayChildren } from 'vue'

interface Renderer<HN = Node, Ele extends HN = Element, EP = { [key: string]: any }> {
  /**
   * @version 8.11
   * @description 总入口, 并负责设置`container.vnode` */
  render: (
    vnode: VVNode<HN, Ele, EP> | null,
    container: Ele | null | undefined,
    testTag?: string
  ) => void

  /** @description 服务端渲染、同构渲染、激活已有DOM */
  hydrate: (vnode: VVNode<HN, Ele, EP> | null, container: Ele | null | undefined) => void

  version: string
}

type WithConfig<
  F extends Function,
  HN = Node,
  Ele extends HN = Element,
  EP = { [key: string]: any }
> = F & { config?: RendererCreatorFactoryConfig<HN, Ele, EP> }

interface RendererCreatorFactoryConfig<
  HN = Node,
  Ele extends HN = Element,
  EP = { [key: string]: any }
> extends Renderer<HN, Ele, EP> {

  /**
   * @version 8.5≥8.1
   * @callBy `render`, `patch`
   * @description 初次挂载, 与`unmount`一同负责设置`vnode.el`
   * @description 不负责维护`container.vnode`的值,由`config.render`维护 */
  mountElement?: (vnode: VVNode<HN, Ele, EP>, container: Ele, testTag?: string) => HN

  /**
   * @version 8.9 
   * @description 实现对`vnode.type`为`string`类型的`vnode`的更新
   * @description 并负责设置`newVNode.el`实现DOM的复用
   * */
  patchElement?: (
    vnode: VVNode<HN, Ele, EP>,
    newVNode: VVNode<HN, Ele, EP>,
    testTag?: string
  ) => VVNode<HN, Ele, EP>

  /**@version 8.9 */
  patchChildren?: (
    vnode: VVNode<HN, Ele, EP>,
    newVNode: VVNode<HN, Ele, EP>,
    container: HN,
    testTag?: string
  ) => VVNode<HN, Ele, EP>

  /**
   * @version 8.11≥8.10≥8.9≥8.6
   * @description 入口检测:
   * @description 1、`vnode`(新的虚拟节点)不能为空
   * @description 注意:
   * @description 1、不负责维护`container.vnode`的值
   * @description 2、负责间接或直接设置`vnode.el`
   * @requires `mountElement`,`patchElement`
   */
  patch?: (
    oldVnode?: VVNode<HN, Ele, EP> | null,
    vnode: VVNode<HN, Ele, EP>,
    container: Ele,
    testTag?: string
  ) => void

  /**
   * @version 8.11≥8.5
   * @description 卸载, 与`mountElement`一同负责设置`vnode.el` */
  unmount?: (oldVnode: VVNode<HN, Ele, EP>) => void

  /**
   * @version 8.1
   * @description 只有在合理的上下文中使用才有意义, 例如`mountChildren`方法中 */
  isVNodeArrayChildrenC?: (v: any) => v is VNodeArrayChildrenC<HN, Ele, EP>

  /**
   * @version 8.1
   * @description 只有在合理的上下文中使用才有意义, 例如`mountChildren`方法中 */
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

export type VNodeChildC<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }> =
  | VNodeChildAtomC<HN, HE, EP>
  | VNodeArrayChildrenC<HN, HE, EP>

export type VNodeNormalizedChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  /* | Exclude<VVNode['children'], VNodeArrayChildren> 
  VVNode['children']的类型就是VNodeNormalizedChildrenC,
  这样就形成循环依赖了!*/
  Exclude<VNode['children'], VNodeArrayChildren> | VNodeArrayChildrenC<HN, HE, EP>

export type VNodeNormalizedChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Exclude<VNode['children'], VNodeArrayChildren> | VNodeArrayChildrenC1<HN, HE, EP>

/**@version 8.9 */
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
  ): (option: RendererConfig<ET, HN, Ele, ParentN, EleNS, Doc>) => Renderer<HN, Ele, EP>
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
