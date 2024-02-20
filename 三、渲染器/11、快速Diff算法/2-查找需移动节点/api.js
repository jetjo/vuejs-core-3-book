import { RendererCreatorFactoryConfig } from '#utils'
import { createArray, defArg0, warn } from '#root/utils'
import baseFactory from '../1-相同的前置和后置元素/api.js'

const VER = '11-2'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

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
        // 只有新增节点的特殊情形
        if (j > oldEndIdx && j <= newEndIdx) {
          // 只有新增节点的特殊情形
          const anchor = newChildren[newEndIdx + 1]?.el
          let i = j
          while (i <= newEndIdx) {
            config.patch(null, newChildren[i], container, anchor)
            i++
          }
        }
        // 只有删除节点的特殊情形
        if (j > newEndIdx && j <= oldEndIdx) {
          // 只有删除节点的特殊情形
          let i = j
          while (i <= oldEndIdx) {
            config.unmount(oldChildren[i]) //, container)
            i++
          }
        }

        if (j <= newEndIdx && j <= oldEndIdx) {
          // throw new Error('暂未支持元素增删及次序变更的混合情形~')
          const newStartI = j
          const oldStartI = j
          /**@description `newChildren`中需进一步处理的节点数量 */
          const count = newEndIdx - newStartI + 1
          /**
           * @description 存储`newChild`在`oldChildren`中的索引, `-1`代表新增的节点
           * @type {number[]}
           * */
          const source = createArray(count, -1)
          /**@description 遍历`oldChildren`的过程中, 在`newChildren`中发现匹配元素的元素数量 */
          let patched = 0
          let needMove = false
          let patchedNewMaxIndex = 0
          for (let i = oldStartI; i <= oldEndIdx; i++) {
            const oldChild = oldChildren[i]
            if (patched === count) {
              // NOTE: if (patched > count) {
              // NOTE: if (patched >= count) {???
              // 说明`newChildren`中的待处理节点已全部被匹配并处理过了, 没有新的子节点可以匹配了, 应该卸载
              config.unmount(oldChild)
              continue
            }

            for (let k = newStartI; k <= newEndIdx; k++) {
              const newChild = newChildren[k]
              if (oldChild?.key === newChild.key) {
                source[k - newStartI] = i
                config.patch(oldChild, newChild, container)
                patched++
                if (k < patchedNewMaxIndex) {
                  needMove = true
                  throw new Error('暂不支持元素次序变更~')
                } else {
                  patchedNewMaxIndex = k
                }
                break
              }
              // 说明遍历到最后一个新节点都没有找到匹配项, 此时应该卸载
              if (k === newEndIdx) {
                config.unmount(oldChild)
              }
            }
          }

          for (let index = 0; index < source.length; index++) {
            const oldI = source[index]
            if (oldI === -1) {
              throw new Error('还未实现排序, 暂不支持新增~')
            }
          }
        }
      }
      return newVnode
    }

    // // @ts-ignore
    // config.patchKeyedChildrenQk = null

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
