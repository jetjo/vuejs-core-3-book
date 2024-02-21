import type { RendererConfig, VNodeArrayChildrenC } from '#shims'
import type { VNode, VNodeArrayChildren } from 'vue'

interface Renderer<HN = Node, Ele extends HN = Element, EP = { [key: string]: any }> {
  /**
   * @version 8.11
   * @description 总入口, 并负责设置`container.vnode` */
  render: (
    vnode: VVNode<HN, Ele, EP> | null,
    container?: Container<Ele, HN, Ele, EP> | null,
    testTag?: string
  ) => void

  /** @description 服务端渲染、同构渲染、激活已有DOM */
  hydrate: (vnode: VVNode<HN, Ele, EP> | null, container: Ele | null | undefined) => void

  version: string
}

type Container<T, HN, Ele, EP> = T & { vnode?: VVNode<HN, Ele, EP> | null }

interface RendererEx<HN = Node, Ele extends HN = Element, EP = { [key: string]: any }>
  extends Renderer<HN, Ele, EP> {
  /**
   * @version 8.5≥8.1
   * @callBy `render`, `patch`
   * @description 初次挂载, 与`unmount`一同负责设置`vnode.el`
   * @description 不负责维护`container.vnode`的值,由`config.render`维护 */
  mountElement: (
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
  patchElement: (
    vnode: VVNode<HN, Ele, EP>,
    newVNode: VVNode<HN, Ele, EP>,
    testTag?: string
  ) => VVNode<HN, Ele, EP>

  /**@version 9.4≥8.9 */
  patchChildren: (
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
  patchKeyedChildren: (
    vnode: VVNodeWithKeyedChildrenC<HN, Ele, EP>,
    newVNode: VVNodeWithKeyedChildren<HN, Ele, EP>,
    container: Ele,
    testTag?: string
  ) => VVNodeWithKeyedChildren<HN, Ele, EP>

  /**
   * @version 11.4,11.3
   * @description 使用`快速Diff`算法对`vnode.children`进行排序
   * @description 用于`patchChildren`方法, 优先级高于`Vue2`使用的`双端Diff`算法
   * */
  patchKeyedChildrenQk: (
    vnode: VVNodeWithKeyedChildrenC<HN, Ele, EP>,
    newVNode: VVNodeWithKeyedChildren<HN, Ele, EP>,
    container: Ele,
    testTag?: string
  ) => VVNodeWithKeyedChildren<HN, Ele, EP>

  /**@version 9.4 */
  requireKeyedChildren: (vnode: VVNodeWithKeyedChildren<HN, Ele>) => boolean

  /**
   * @version 9.5
   * @description 用于`patchChildren`方法, 负责挂载`newChildren`中新增的节点
   * @param {number} newChildIndex 在使用`Diff`算法排序子节点的过程中顺带发现的新节点的索引
   * */
  handleChildAdd: (
    newChildren: VVNode<HN, Ele, EP>['children'],
    container: HN,
    newChildIndex: number
  ) => void

  /**
   * @version 9.5
   * @description 用于`patchChildren`方法, 负责查找并卸载不存在于`newChildren`中的节点
   * */
  handleChildRemove: (
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
  patch: (
    oldVnode?: VVNode<HN, Ele, EP> | null,
    vnode: VVNode<HN, Ele, EP>,
    container: Ele,
    anchor?: HN | null,
    testTag?: string
  ) => void

  /**
   * @version 8.11≥8.5
   * @description 卸载, 与`mountElement`一同负责设置`vnode.el` */
  unmount: (oldVnode?: VVNode<HN, Ele, EP>) => void

  /**
   * @version 8.1
   * @description 只有在合理的上下文中使用才有意义, 例如`mountChildren`方法中 */
  isVNodeArrayChildrenC: (v: any) => v is VNodeArrayChildrenC<HN, Ele, EP>

  /**
   * @version 8.1
   * @description 只有在合理的上下文中使用才有意义, 例如`mountChildren`方法中 */
  isVNodeChildAtomC_VVNode: (v: any) => v is VVNode<HN, Ele, EP> //| ((v: any)=> boolean)
}

/**@version 8.9 */
interface RendererFactory<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document,
  EP = { [key: string]: any }
> {
  (option: RendererConfig<ET, HN, Ele, ParentN, EleNS, Doc>): RendererEx<HN, Ele, EP>
  version: string
}

export type { RendererEx, RendererFactory, Renderer }
