import { RendererCreatorFactoryConfig, requireCallable, setValOfFnType } from '#utils'
import { defArg0, warn } from '#root/utils'
import baseFactory from '../3-非理想状况的处理/api.js'

const VER = '10-4'

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
        if (oldStartNode === undefined) {
          oldStartIdx++
          continue
        }
        let newEndNode = newChildren[newEndIdx],
          oldEndNode = oldChildren[oldEndIdx]
        if (oldEndNode === undefined) {
          oldEndIdx--
          continue
        }
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
        // @ts-ignore
        const idxInOld = oldChildren.findIndex(node => node && node.key === newStartNode.key)
        const oldNodeToMove = oldChildren[idxInOld]
        if (idxInOld !== -1 && oldNodeToMove) {
          // if (!oldNodeToMove) throw new Error('oldNodeToMove不存在')
          if (!oldNodeToMove.el) throw new Error('oldNodeToMove.el不存在')
          config.patch(oldNodeToMove, newStartNode, container)
          const anchor = oldStartNode.el
          option.insert(oldNodeToMove.el, container, anchor)
          oldChildren[idxInOld] = undefined
          newStartIdx++
          continue
        }
        // NOTE: 至此, 说明新的头部节点是新增的节点
        config.patch(null, newStartNode, container, oldStartNode.el)
        newStartIdx++
      }
      if (newStartIdx <= newEndIdx && oldEndIdx < oldStartIdx) {
        const anchor = newChildren[newEndIdx + 1]?.el
        for (let i = newStartIdx; i <= newEndIdx; i++) {
          config.patch(null, newChildren[i], container, anchor)
        }
      }
      if (oldStartIdx <= oldEndIdx) throw new Error('oldChildren还有剩余节点, 暂不处理')
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
