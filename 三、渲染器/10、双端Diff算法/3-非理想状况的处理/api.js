import { requireCallable, setValOfFnType } from '#utils'
import { warn } from '#root/utils'
import baseFactory from '../1-双端比较的原理/api.js'

const VER = '10-3'

/**@type {typeof baseFactory} */
const factory = function (option) {
  const config = baseFactory(option)

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
      // NOTE: 至此, 说明新的头部节点是新增的节点, 不进一步处理, 会陷入死循环
      throw new Error('暂不处理都不匹配的情形, 以防陷入死循环')
    }
    if (newStartIdx <= newEndIdx) throw new Error('newChildren还有剩余节点, 暂不处理')
    if (oldStartIdx <= oldEndIdx) throw new Error('oldChildren还有剩余节点, 暂不处理')
    return newVnode
  }

  setValOfFnType(config, 'patchKeyedChildren', patchKeyedChildren)

  // @ts-ignore
  // config.patchKeyedChildren = null // void 0

  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
