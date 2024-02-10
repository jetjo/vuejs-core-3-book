// @ts-check
import baseFactory from '../3-正确地设置元素属性/api.js'

/**@type {typeof baseFactory} */
function factory(config) {
  // @ts-ignore
  const baseCtor = baseFactory({})
  return function createRenderer(option) {
    // @ts-ignore
    config = baseCtor(option)

    const { mountChildren, mountProps, mountElement, patch } = config

    let { render, hydrate, unmount } = config

    unmount ||= function (vnode) {
      if(!vnode.el) return
      const parent = vnode.el.parentNode
      if (parent) {
        parent.removeChild(vnode.el)
      }
    }
    render = function (vnode, container) {
      if (!container) throw new Error('container不存在')
      const oldVnode = container.vnode
      if (oldVnode && vnode) {
        patch(oldVnode, vnode, container)
        return
      }
      // vnode和oldVnode不同时存在
      if (vnode) {
        mountElement(vnode, container)
        return
      }
      if (oldVnode) {
        // // NOTE: 这样卸载,有很多不足:
        // // 1、如果`container`的一些子节点是由`Vue`组件渲染的,需要调用生命周期的相关钩子, 例如`unmounted`
        // // 2、如果一些节点关联了`Vue`的自定义指令,需要调用相关的钩子,例如`unmounted`
        // // 3、仅清空`innerHTML`,也无法移除绑定在节点上的事件监听器
        // container.innerHTML = ''、
        unmount(oldVnode)
        container.vnode = null
      }
    }

    // @ts-ignore 服务端渲染、同构渲染、激活已有DOM
    hydrate = function (vnode, container) {
      throw new Error('Method not implemented.')
    }

    return {
      mountChildren,
      mountProps,
      mountElement,
      patch,
      render,
      hydrate
    }
  }
}

export default factory
