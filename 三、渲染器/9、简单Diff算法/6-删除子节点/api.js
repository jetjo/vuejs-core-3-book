import { assertUnknown } from '#utils'
import baseFactory from '../5-新增节点/api.js'

const VER = '9-6'

/**@type {typeof baseFactory} */
const factory = function (option) {
  const config = baseFactory(option)

  config.handleChildRemove = (newChildren, oldChildren) => {
    if (!config.isVNodeArrayChildrenC(newChildren)) throw new Error('newChildren必须是数组')
    if (!config.isVNodeArrayChildrenC(oldChildren)) throw new Error('oldChildren必须是数组')
    let i = oldChildren.length
    while (i--) {
      const oldChild = oldChildren[i]
      if (!config.isVNodeChildAtomC_VVNode(oldChild)) throw new Error('oldChildren的元素必须是VNode类型') // prettier-ignore
      let find = false
      for (let j = newChildren.length; j--; ) {
        const newChild = newChildren[j]
        if (!config.isVNodeChildAtomC_VVNode(newChild)) throw new Error('newChildren的元素必须是VNode类型') // prettier-ignore
        if (oldChild.key === newChild.key) {
          find = true
          break
        }
      }
      if (!find) config.unmount(oldChild)
    }
  }

  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
