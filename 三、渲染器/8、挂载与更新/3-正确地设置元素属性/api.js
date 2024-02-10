// @ts-check
/**@type {import('#shims').RendererCreatorFactory} */
function factory({
  mountChildren,
  mountProps,
  mountElement,
  patch,
  render
  // hydrate
}) {
  return function createRenderer({
    createElement,
    setElementText,
    patchProps,
    insert,
    addEventListener: on
  }) {
    mountChildren ||= function (children, container) {
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (
            typeof child !== 'object' ||
            child === null ||
            Array.isArray(child)
          ) {
            throw new Error('children类型不正确')
          }
          patch(null, child, container)
        })
        return
      }
      if (typeof children === 'string') {
        setElementText(container, children)
        return
      }
      console.warn('children类型不正确', children)
    }

    mountProps ||= function (props, container) {
      for (const key in props) {
        // if (Object.hasOwnProperty.call(props, key)) {}
        const val = props[key]
        if (key.startsWith('on') && typeof val === 'function') {
          on && on(container, key, props[key])
          return
        }
        patchProps(container, key, null, props[key])
      }
    }

    mountElement ||= function (vnode, container) {
      const { type, props, children } = vnode
      if (typeof type !== 'string') throw new Error('type不是字符串')
      const ele = createElement(type)
      props && mountProps(props, ele)
      children && mountChildren(children, ele)
      insert(ele, container, null)
      container.vnode = vnode
    }

    patch ||= function (oldVnode, vnode, container) {
      if (!oldVnode) {
        mountElement(vnode, container)
      }
      throw new Error('Method not implemented.')
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
        container.innerHTML = ''
        container.vnode = null
      }
    }

    // @ts-ignore 服务端渲染、同构渲染、激活已有DOM
    function hydrate(vnode, container) {
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
