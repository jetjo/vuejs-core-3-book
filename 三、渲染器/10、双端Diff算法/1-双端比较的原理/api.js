import { RendererCreatorFactoryConfig, requireCallable, setValOfFnType } from '#utils'
import { defArg0, warn } from '#root/utils'
import baseFactory from '../../9、简单Diff算法/6-删除子节点/api.js'

const VER = '10-1'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    // @ts-ignore
    function patchKeyedChildren(vnode, newVnode, container) {
      requireCallable(config.patch)
      let newChildren = newVnode.children || []
      let oldChildren = vnode.children || []
      if (newChildren.length === 0 && oldChildren.length === 0) {
        warn(`newChildren或oldChildren为空，不需要diff`)
        return newVnode
      }
      let newStartIdx = 0,
        oldStartIdx = 0
      let newEndIdx = newChildren.length - 1,
        oldEndIdx = oldChildren.length - 1
      while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
        let newStartNode = newChildren[newStartIdx],
          oldStartNode = oldChildren[oldStartIdx]
        let newEndNode = newChildren[newEndIdx],
          oldEndNode = oldChildren[oldEndIdx]
        if (!oldStartNode || !oldEndNode) throw new Error('oldStartNode或oldEndNode不存在')
        if (!oldStartNode.el || !oldEndNode.el)
          throw new Error('oldStartNode.el或oldEndNode.el不存在')
        if (newStartNode.key === oldStartNode.key) {
          config.patch(oldStartNode, newStartNode, container)
          newStartIdx++
          oldStartIdx++
          continue
        }
        if (newEndNode.key === oldEndNode.key) {
          config.patch(oldEndNode, newEndNode, container)
          newEndIdx--
          oldEndIdx--
          continue
        }
        if (newEndNode.key === oldStartNode.key) {
          config.patch(oldStartNode, newEndNode, container)
          const anchor = oldEndNode.el?.nextSibling
          option.insert(oldStartNode.el, container, anchor)
          newEndIdx--
          oldStartIdx++
          continue
        }
        if (newStartNode.key === oldEndNode.key) {
          config.patch(oldEndNode, newStartNode, container)
          const anchor = oldStartNode.el // ?.nextSibling ???
          option.insert(oldEndNode.el, container, anchor)
          newStartIdx++
          oldEndIdx--
          continue
        }
        // NOTE: 至此, 四种比较都没匹配, 指向四个端点的索引没有移动, 如果不进一步处理, 会陷入死循环
        // 目前先不处理
        throw new Error('暂不处理都不匹配的情形, 以防陷入死循环')
      }
      return newVnode
    }

    setValOfFnType(config, 'patchKeyedChildren', patchKeyedChildren)

    // @ts-ignore
    // config.patchKeyedChildren = null // void 0

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
