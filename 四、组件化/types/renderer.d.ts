export * from '@jetjo/vue3-chapter3'
import { RendererEx } from '@jetjo/vue3-chapter3'

export interface RendererEx4<HN = Node, Ele extends HN = Element> extends RendererEx<HN, Ele> {
  /**
   * @version 4.1.0≥3.8.11≥3.8.10≥3.8.9≥3.8.6
   * @description 入口检测:
   * @description 1、`vnode`(新的虚拟节点)不能为空
   * @description 注意:
   * @description 1、不负责维护`container.vnode`的值
   * @description 2、负责间接或直接设置`vnode.el`
   * @param {HN | null} [anchor] 用于支持`patchChildren`方法在`container`中的起始位置新增节点
   * @requires `mountElement`,`patchElement`
   */
  patch: <EP extends { [key: string]: any }>(
    oldVnode?: VVNode<HN, Ele, EP> | null,
    vnode: VVNode<HN, Ele, EP>,
    container: Ele,
    anchor?: HN | null,
    testTag?: string
  ) => void

  /**@version 4.1.0 */
  mountComponent: (
    vnode: VComponent<HN, Ele>,
    container: Ele,
    anchor?: HN | null,
    testTag?: string
  ) => void

  /**@version 4.1.0 */
  patchComponent: <EP extends { [key: string]: any }>(
    oldVnode?: VComponent<HN, Ele, EP> | null,
    vnode: VComponent<HN, Ele, EP>,
    anchor?: HN | null,
    testTag?: string
  ) => void

  /**@version 4.1.0 */
  isComponentVNode: (vnode: any) => vnode is VComponent<HN, Ele>
}
