import { RendererCreatorFactoryConfig } from '#utils'
import { createArray, defArg0, getSequence, throwErr, warn } from '#root/utils'
import baseFactory from '../3-如何移动元素/api'

const VER = '11-4'

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
        warn(`newChildren和oldChildren都为空，不需要diff`)
        return newVnode
      }
      // 处理前置节点; 从头开始比较, 直到遇到不匹配的节点
      const startI = (function handlePrefixSame() {
        let j = 0
        // // 处理前置节点存在匹配且次序不变的特殊情形
        // // 最终的退出条件是两个数组至少其中一个已经遍历完毕,
        // // 其中一个已经遍历完毕了,也就不存在再有匹配元素的可能了
        // for (; j < newChildren.length && j < oldChildren.length; j++) {
        //   const oldChild = oldChildren[j]
        //   const newChild = newChildren[j]
        //   if (!oldChild) throw new Error('oldChild不应是空!')
        //   if (oldChild.key !== newChild.key) break
        //   config.patch(oldChild, newChild, container)
        // }
        if (j === newChildren.length || j === oldChildren.length) {
          warn('处理前置节点前,  \`oldChildren\`和\`newChildren\`之中至少有一个是空数组!') // prettier-ignore
          return j
        }
        let oldChild = oldChildren[j]
        let newChild = newChildren[j]
        if (!oldChild) throw new Error('oldChild不应是空!')
        // @ts-ignore
        while (oldChild.key === newChild.key) {
          config.patch(oldChild, newChild, container)
          j++
          // 防止当新旧两个数组完全一致时继续执行
          if (j === oldChildren.length || j === newChildren.length) {
            warn('处理前置节点时,  \`oldChildren\`和\`newChildren\`之中至少有一个已经遍历完毕!') // prettier-ignore
            break
          }
          oldChild = oldChildren[j]
          newChild = newChildren[j]
        }
        return j
      })()
      // 处理后置节点; 从尾开始比较, 直到遇到不匹配的节点
      const [newEndIdx, oldEndIdx] = (function handleSuffixSame() {
        let oldEndIdx = oldChildren.length - 1
        let newEndIdx = newChildren.length - 1
        // // 处理后置节点存在匹配且次序不变的特殊情形
        // for (; oldEndIdx >= 0 && newEndIdx >= 0; newEndIdx--, oldEndIdx--) {
        //   const oldChild = oldChildren[oldEndIdx]
        //   const newChild = newChildren[newEndIdx]
        //   if (!oldChild) throw new Error('oldChild不应是空!')
        //   if (oldChild.key !== newChild.key) break
        //   config.patch(oldChild, newChild, container)
        // }
        if (oldEndIdx < startI || newEndIdx < startI) {
          warn('在处理完前置节点后, 其中至少有一方已经完全处理完毕!')
          return [newEndIdx, oldEndIdx]
        }
        let oldChild = oldChildren[oldEndIdx]
        let newChild = newChildren[newEndIdx]
        while (oldChild?.key === newChild.key) {
          config.patch(oldChild, newChild, container)
          oldEndIdx--
          newEndIdx--
          if (oldEndIdx < startI || newEndIdx < startI) {
            warn('在处理后置节点时, 其中至少有一方已经完全处理完毕!')
            return [newEndIdx, oldEndIdx]
          }
          oldChild = oldChildren[oldEndIdx]
          newChild = newChildren[newEndIdx]
        }
        return [newEndIdx, oldEndIdx]
      })()

      if (startI > oldEndIdx && startI > newEndIdx) {
        warn('经过前置和后置处理, 新旧子节点完全处理完毕!')
        return newVnode
      }
      // 只有新增节点、只有删除节点、无增减, 且次序未变的特殊情形
      const handled = (function handleAddOrDelONly() {
        if (startI > oldEndIdx && startI <= newEndIdx) {
          // 只有新增节点的特殊情形
          const anchorI = newEndIdx + 1
          const anchor = anchorI < newChildren.length ? newChildren[newEndIdx + 1].el : null
          for (let i = startI; i <= newEndIdx; i++) {
            config.patch(null, newChildren[i], container, anchor)
          }
          return true
        }
        if (startI > newEndIdx && startI <= oldEndIdx) {
          // 只有删除节点的特殊情形
          for (let i = startI; i <= oldEndIdx; i++) {
            config.unmount(oldChildren[i]) //, container)
          }
          return true
        }
        return newEndIdx < startI && oldEndIdx < startI
      })()
      if (handled) return newVnode
      // 新增、删除、排序并存的情形
      // if (startI <= newEndIdx && startI <= oldEndIdx) {
      // 得到`newChildren`中的节点在`oldChildren`中的索引,
      // 如果`newChildren`中的节点在`oldChildren`中出现的次序和其在`newChildren`中的次序一致,
      // 那么这些索引组成的序列`source`应该是完全递增的, 不一定连续
      // 否则,就算出`source`中的一个最长的递增子序列,
      // NOTE: 最长递增子序列的含义是, 如果从`source`中排除所有索引不在递增子序列中的元素,
      // 那么剩下的元素其值是递增的
      // 也就是要对`source`元素排序,使其成为递增序列时,
      // 最长递增子序列中的索引号所代表的位置的元素不需要移动
      const { source, needMove, hasNewAdd } = (function getIdxAtOldChildrenOfNewChild() {
        const newStartI = startI
        const oldStartI = startI
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
        // 构建索引表
        /**@type {*} */
        const keyIndex = {}
        for (let i = newStartI; i <= newEndIdx; i++) {
          const newChild = newChildren[i]
          if (newChild.key === null) throw new Error('newChild.key不应该是null!')
          keyIndex[newChild.key] = i
        }
        Object.freeze(keyIndex)
        for (let i = oldStartI; i <= oldEndIdx; i++) {
          const oldChild = oldChildren[i]
          if (!oldChild) throw new Error('oldChild不应该是null!')
          if (patched === count) {
            // NOTE: if (patched > count) {
            // NOTE: if (patched >= count) {???
            // 说明`newChildren`中的待处理节点已全部被匹配并处理过了, 没有新的子节点可以匹配了, 应该卸载
            config.unmount(oldChild)
            continue
          }

          // for (let k = newStartI; k <= newEndIdx; k++) {
          if (oldChild.key === null) throw new Error('oldChild.key不应该是null!')
          const k = Number(keyIndex[oldChild.key])
          if (!isNaN(k)) {
            const newChild = newChildren[k]
            // if (oldChild && oldChild.key === newChild.key) {
            source[k - newStartI] = i
            config.patch(oldChild, newChild, container)
            patched++
            if (k < patchedNewMaxIndex) {
              needMove = true
            } else {
              patchedNewMaxIndex = k
            }
            // break// }
          } else {
            // 说明没有找到匹配项, 此时应该卸载
            config.unmount(oldChild)
          } // }
        }
        if (keyIndex) return { source, needMove, hasNewAdd: source.includes(-1) }
        throwErr('下面是死代码, keyIndex不应该是null!')
        // NOTE: 下面是原本的算法, 采用两层`for`循环嵌套;
        // 时间复杂度为`O(n1*n2)`, `n1`和`n2`分别是`newChildren`和`oldChildren`的长度
        // 当`newChildren`和`oldChildren`的长度都很大时, 这种算法的性能会很差
        // 因此采用上面的算法, 首先为`newChildren`构建一张索引表,
        // 索引表中的字段名是`newChild.key`, 字段值是`newChild`在`newChildren`中的索引;
        // 然后遍历`oldChildren`, 通过索引表快速找到`newChildren`中的匹配元素
        // 这种算法的时间复杂度是`O(n)`
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
            if (oldChild && oldChild.key === newChild.key) {
              source[k - newStartI] = i
              config.patch(oldChild, newChild, container)
              patched++
              if (k < patchedNewMaxIndex) {
                needMove = true
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
        return { source, needMove, hasNewAdd: source.includes(-1) }
      })()
      if (!needMove && !hasNewAdd) return newVnode
      // 至此`oldChildren`已处理完毕, 匹配到`newChildren`中的节点已经`patch`,
      // 未匹配到的节点已经`unmount`;
      // 那些被匹配到的`newChild`,其`.el`字段已经指向可复用的DOM节点,
      // 没用被匹配到的`newChild`,其在`source`中对应位置处存储的索引值为`-1`
      // if (needMove) {
      // 至此, 说明索引位于`startI`到`newEndIdx`的`newChild`所指向的DOM节点
      // 没有按(newChildren的)次序出现在页面
      // `LIS`中的索引号所代表的位置的元素不需要移动
      const LIS = getSequence(source)
      // @ts-ignore
      const getAnchor = i => {
        // const anchor = newChildren[startI + i - 1].el?.nextSibling
        // NOTE: 因为目前节点的处理顺序是从尾部往上,
        // 所以当前节点的下一个节点的DOM位置才是已经处理过的正确的位置
        const pos = startI + i + 1
        return pos < newChildren.length ? newChildren[pos].el : null // ?.nextSibling
      }
      for (let i = source.length - 1, endLIS = LIS.length - 1; i >= 0; i--) {
        // NOTE: 这里要注意, 应该先判断是不是要新增的元素;
        // 然后再判断是不是需要移动的元素;
        // 举个特例: 如果`source[0]`是`-1`,
        // 因为索引都满足`≥0`, 而`source[0]`又是`-1`;
        // `source`中没有比`-1`更小的;
        // 因此, 索引`0`很可能出现在最长子序列`LIS`中;
        // 也就是`LIS[0]`是`0`;
        // 如果先判断一个节点是否需要移动(即`source[i] === LIS[endLIS]`)
        // 会把一个本应该新增的节点误判成一个存在的不需要移动的节点!
        if (source[i] === -1) {
          config.patch(null, newChildren[startI + i], container, getAnchor(i))
          continue
        }
        if (i === LIS[endLIS]) {
          // NOTE: 注意, 最长递增子序列`LIS`存储的是`source`的索引, 不是值
          // if (source[i] === LIS[endLIS]) { // holy shit!!!🤬
          endLIS--
          continue
        }
        option.insert(newChildren[startI + i].el, container, getAnchor(i))
      }
      // }
      // }
      return newVnode
    }

    // // @ts-ignore
    // config.patchKeyedChildrenQk = null

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
