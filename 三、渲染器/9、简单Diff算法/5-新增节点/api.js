import { assertUnknown } from '#utils'
import baseFactory from '../4-子节点移动/api.js'

const VER = '9-5'

/**@type {typeof baseFactory} */
const factory = function (option) {
  const config = baseFactory(option)

  config.handleChildAdd = function (children, container, index) {
    assertUnknown(container, option.patchProps.isElement)
    if (!config.isVNodeArrayChildrenC(children)) throw new Error('children必须是VNode数组')
    const child = children[index]
    if (!config.isVNodeChildAtomC_VVNode(child)) throw new Error('child必须是VNode类型')

    const preNewChild = children[index - 1]
    let anchor
    if (preNewChild) {
      if(!config.isVNodeChildAtomC_VVNode(preNewChild)) throw new Error('preNewChild必须是VNode类型') // prettier-ignore
      if (!preNewChild.el) throw new Error('patch过程中, 上一个节点挂载异常!')
      anchor = option.getNextSibling(preNewChild.el) // .nextSibling
    }
    // NOTE: 当`preNewChild`是当前最后一个子节点时, `anchor`不存在是正常的,
    // 此时不应该把`anchor`设置为`container.firstChild`, 否则,本应插入到底部的节点会插入到顶部
    // if (!anchor) anchor = container.firstChild
    if (!preNewChild) anchor = option.getNextSibling(container) // .firstChild
    config.patch(null, child, container, anchor)
  }
  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
