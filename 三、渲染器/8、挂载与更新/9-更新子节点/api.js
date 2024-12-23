import { assertUnknown } from '#utils'
import { warn } from '#root/utils'
import baseFactory from '../6-区分vnode类型/api.js'

const VER = '8-9'

/**@type {typeof baseFactory} */
const factory = function (option) {
  const config = baseFactory(option)

  const basePatch = config.patch
  /**
   * @description 目前实现三个目标:
   * @description 1、当`vnode`不存在,并且`newVnode`存在时,完成初次挂载
   * @description 2、新旧节点`type`不同时,没有`patch`的必要,需要完全替换节点; 先卸载旧节点,再挂载新节点
   * @description 3、新旧节点`type`相同时,执行`patchElement`操作
   * @description 以下是当前的限制:
   * @description 1、并且只支持`type`为`string`的节点
   * @description 2、`vnode.type`的值需要分多种情况处理, type是字符串代表原生标签, type是对象代表组件等等
   */
  config.patch = function (vnode, newVnode, container, anchor) {
    if (!newVnode) throw new Error('newVnode不存在. patch操作不负责卸载节点!')
    if (typeof newVnode.type !== 'string') throw new Error('type不是字符串')
    const testFlag = arguments[4]
    if (vnode && vnode.type === newVnode.type)
      return config.patchElement(vnode, newVnode, testFlag)
    // 1、初次挂载 2、type不同时,先卸载后挂载
    return basePatch(vnode, newVnode, container, anchor, testFlag)
  }

  config.patchElement = function (vnode, newVnode) {
    const testFlag = arguments[2]
    // NOTE: 别忘将`newVnode`的`el`属性指向`vnode`的`el`
    const el = (newVnode.el = vnode.el)
    if (el === null) throw new Error('节点已被卸载,无法进行patch操作')
    if (el === undefined) throw new Error('挂载虚拟节点后,忘记了设置`el`属性')
    const isElement = option.patchProps.isElement
    if (!isElement) throw new Error('Element类型验证为实现!')
    // @ts-ignore
    assertUnknown(el, isElement, testFlag) //, '÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷')
    /**@type {Record<string, any>} */
    const def = {}
    const oldProps = vnode.props || def
    const newProps = newVnode.props || def
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        option.patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (const key in oldProps) {
      // if (Object.hasOwnProperty.call(oldProps, key))
      if (!(key in newProps)) option.patchProps(el, key, oldProps[key], null)
    }
    config.patchChildren(vnode, newVnode, el, testFlag)
    return newVnode
  }

  config.patchChildren = function (vnode, newVnode, container) {
    // 由于Fragment存在, vnode的el不一定是readilyNode
    // config.patchChildren = function (vnode, newVnode, readilyNode) {
    const testFlag = arguments[3]
    assertUnknown(container, option.patchProps.isElement, testFlag)
    // 新旧节点个有三种情况, 1、null, 2、string, 3、array
    // 共用9中组合
    const children = newVnode.children
    // container.vnode = children ???
    const oldChildren = vnode.children
    const unmountChildren = () => {
      if (typeof oldChildren === 'string') {
        option.setElementText(container, '') //文本节点
        return
      }
      if (!config.isVNodeArrayChildrenC(oldChildren)) return; // prettier-ignore
      oldChildren.forEach(child => {
        if (!config.isVNodeChildAtomC_VVNode(child)) throw new Error('child is not vnode') // prettier-ignore
        config.unmount(child)
      })
    }
    if (config.isVNodeArrayChildrenC(children)) {
      if (config.isVNodeArrayChildrenC(oldChildren)) {
        throw new Error('暂不处理')
      }
      if (typeof oldChildren === 'string') {
        option.setElementText(container, '')
        warn('新节点是数组, 旧节点是文本', testFlag)
      }
      // config.mountChildren(newVnode.children, container, testFlag)
      children.forEach(child => {
        if (!config.isVNodeChildAtomC_VVNode(child)) throw new Error('child is not vnode') // prettier-ignore
        config.patch(null, child, container)
      })
      return newVnode
    }
    if (typeof children === 'string') {
      unmountChildren()
      option.setElementText(container, children)
      return newVnode
    }
    // 卸载旧的`children`
    unmountChildren()
    return newVnode
  }

  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
