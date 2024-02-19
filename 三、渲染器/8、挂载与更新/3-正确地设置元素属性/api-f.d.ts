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
  mountElement?: (
    vnode: VVNode<HN, Ele, EP>,
    container: Ele,
    anchor?: HN | null,
    testTag?: string
  ) => HN

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

  /**@version 9.4≥8.9 */
  patchChildren?: (
    vnode: VVNode<HN, Ele, EP>,
    newVNode: VVNode<HN, Ele, EP>,
    container: HN,
    testTag?: string
  ) => VVNode<HN, Ele, EP>

  /**
   * @version 10.5
   * @description 使用`双端Diff`算法对`vnode.children`进行排序
   * @description 用于`patchChildren`方法, 优先级高于`简单Diff`算法
   * */
  patchKeyedChildren?: (
    vnode: VVNodeWithKeyedChildrenC<HN, Ele, EP>,
    newVNode: VVNodeWithKeyedChildren<HN, Ele, EP>,
    container: Ele,
    testTag?: string
  ) => VVNodeWithKeyedChildren<HN, Ele, EP>

  /**
   * @version 10.5
   * @description 使用`快速Diff`算法对`vnode.children`进行排序
   * @description 用于`patchChildren`方法, 优先级高于`Vue2`使用的`双端Diff`算法
   * */
  patchKeyedChildrenQk?: (
    vnode: VVNodeWithKeyedChildrenC<HN, Ele, EP>,
    newVNode: VVNodeWithKeyedChildren<HN, Ele, EP>,
    container: Ele,
    testTag?: string
  ) => VVNodeWithKeyedChildren<HN, Ele, EP>

  /**@version 9.4 */
  requireKeyedChildren?: (vnode: VVNodeWithKeyedChildren<HN, Ele>) => boolean

  /**
   * @version 9.5
   * @description 用于`patchChildren`方法, 负责挂载`newChildren`中新增的节点
   * @param {number} newChildIndex 在使用`Diff`算法排序子节点的过程中顺带发现的新节点的索引
   * */
  handleChildAdd?: (
    newChildren: VVNode<HN, Ele, EP>['children'],
    container: HN,
    newChildIndex: number
  ) => void

  /**
   * @version 9.5
   * @description 用于`patchChildren`方法, 负责查找并卸载不存在于`newChildren`中的节点
   * */
  handleChildRemove?: (
    newChildren: VVNode<HN, Ele, EP>['children'],
    oldChildren: VVNode<HN, Ele, EP>['children']
  ) => void

  /**
   * @version 8.11≥8.10≥8.9≥8.6
   * @description 入口检测:
   * @description 1、`vnode`(新的虚拟节点)不能为空
   * @description 注意:
   * @description 1、不负责维护`container.vnode`的值
   * @description 2、负责间接或直接设置`vnode.el`
   * @param {HN | null} [anchor] 用于支持`patchChildren`方法在`container`中的起始位置新增节点
   * @requires `mountElement`,`patchElement`
   */
  patch?: (
    oldVnode?: VVNode<HN, Ele, EP> | null,
    vnode: VVNode<HN, Ele, EP>,
    container: Ele,
    anchor?: HN | null,
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

export type VNodeChildAtomKeyed<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VVNode<HN, HE, EP> & { key: unknown }

type VNodeOptProps<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }> = Omit<
  VVNode<HN, HE, EP>,
  'type' | 'props' | 'children' | 'el'
>

export type VVNodeOptionalSFC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Partial<VNodeOptProps<HN, HE, EP>> &
  Pick<VVNode<HN, HE, EP>, 'type' | 'props' | 'children' | 'el'>

export type VNodeChildAtomC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  | (Omit<VVNodeOptionalSFC<HN, HE, EP>, 'children'> & {
      children?: VNodeNormalizedChildrenC1<HN, HE, EP>
    })
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VNodeArrayChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC<HN, HE, EP> | VNodeChildAtomC<HN, HE, EP>>

export type VNodeArrayChildrenKeyed<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeChildAtomKeyed<HN, HE, EP>>

export type VNodeArrayChildrenKeyedC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeChildAtomKeyed<HN, HE, EP> | undefined>

export type VNodeNormalizedChildrenKeyed<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VNodeArrayChildrenKeyed<HN, HE, EP>

export type VNodeNormalizedChildrenKeyedC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VNodeArrayChildrenKeyedC<HN, HE, EP>

export type VNodeArrayChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC1<HN, HE, EP> | VNodeChildAtomC1<HN, HE, EP>>

export type VNodeChildC<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }> =
  | VNodeChildAtomC<HN, HE, EP>
  | VNodeArrayChildrenC<HN, HE, EP>

type ChildC = Exclude<VNode['children'], VNodeArrayChildren>

export type VNodeNormalizedChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  /* | Exclude<VVNode['children'], VNodeArrayChildren> 
  VVNode['children']的类型就是VNodeNormalizedChildrenC,
  这样就形成循环依赖了!*/
  ChildC | VNodeArrayChildrenC<HN, HE, EP>

export type VNodeNormalizedChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = ChildC | VNodeArrayChildrenC1<HN, HE, EP>

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
