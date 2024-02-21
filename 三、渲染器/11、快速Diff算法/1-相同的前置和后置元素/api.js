import { warn } from '#root/utils'
import baseFactory from '../../10、双端Diff算法/5-删除元素/api.js'

const VER = '11-1'

/**@type {typeof baseFactory} */
const factory = function (option) {
  const config = baseFactory(option)

  config.patchKeyedChildrenQk = (vnode, newVnode, container) => {
    let newChildren = newVnode.children || []
    let oldChildren = vnode.children || []
    if (newChildren.length === 0 && oldChildren.length === 0) {
      warn(`newChildren或oldChildren为空，不需要diff`)
      return newVnode
    }
    let j = 0
    // 处理前置节点存在匹配且次序不变的特殊情形
    while (j < newChildren.length && j < oldChildren.length) {
      const oldChild = oldChildren[j]
      const newChild = newChildren[j]
      if (oldChild?.key !== newChild?.key) {
        break
      }
      config.patch(oldChild, newChild, container)
      j++
    }
    let oldEndIdx = oldChildren.length - 1
    let newEndIdx = newChildren.length - 1
    // 处理后置节点存在匹配且次序不变的特殊情形
    while (oldEndIdx >= 0 && newEndIdx >= 0) {
      const oldChild = oldChildren[oldEndIdx]
      const newChild = newChildren[newEndIdx]
      if (oldChild?.key !== newChild?.key) {
        break
      }
      config.patch(oldChild, newChild, container)
      oldEndIdx--
      newEndIdx--
    }
    if (j <= newEndIdx || j <= oldEndIdx) {
      // throw new Error('暂不支持元素的增删及次序变更~')
      if (j > oldEndIdx && j <= newEndIdx) {
        // 只有新增节点的特殊情形
        const anchor = newChildren[newEndIdx + 1]?.el
        let i = j
        while (i <= newEndIdx) {
          config.patch(null, newChildren[i], container, anchor)
          i++
        }
      }
      if (j > newEndIdx && j <= oldEndIdx) {
        // 只有删除节点的特殊情形
        let i = j
        while (i <= oldEndIdx) {
          config.unmount(oldChildren[i]) //, container)
          i++
        }
      }

      if (j <= newEndIdx && j <= oldEndIdx)
        throw new Error('暂未支持元素增删及次序变更的混合情形~')
    }
    return newVnode
  }

  // // @ts-ignore
  // config.patchKeyedChildrenQk = null

  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
