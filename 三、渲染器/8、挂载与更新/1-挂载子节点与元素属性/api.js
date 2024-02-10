// 抽离特定于平台的API
// 将特定于平台的API视为配置项, 作为参数传入
/**
 * @param {import('@jetjo/vue3-chapter3').RendererConfig} options
 */
function createRenderer({
  createElement,
  setElementText,
  setAttribute,
  addEventListener,
  insert
}) {
  /**
   * @description 挂载子节点children到父节点container
   * @param {VVNode['children']} children
   * @param {Node} container
   */
  function mountChildren(children, container) {
    if (typeof children === 'string') {
      // 文本节点
      setElementText(container, children)
      return
    }
    if (Array.isArray(children)) {
      children.forEach(child => {
        patch(null, child, container)
      })
    }
  }

  /**
   * @description 挂载attribute到节点
   * @param {VVNode['props']} props
   * @param {Element} container
   */
  function mountProps(props, container) {
    for (const key in props) {
      // if (Object.hasOwnProperty.call(props, key)) {}
      const element = props[key]
      if (key.startsWith('on') && typeof element === 'function') {
        addEventListener && addEventListener(container, key, element)
      } else {
        setAttribute && setAttribute(container, key, element)
      }
    }
  }

  /**
   * @description 将vdom node挂载到配置指定的平台
   * @param {VVNode} vnode
   * @param {Node} container
   */
  function mountElement(vnode, container) {
    const { type, props, children } = vnode
    if (typeof type !== 'string') throw new Error('type is not string')
    const el = createElement(type)
    // 挂载子节点
    mountChildren(children, el)
    // 挂载props
    mountProps(props, el)
    insert(el, container, null)
  }

  // @ts-ignore
  function patch(oldVnode, vnode, container) {
    if (!oldVnode) {
      // 挂载
      mountElement(vnode, container)
      return
    }
    throw new Error('Not implemented')
  }

  // @ts-ignore
  function render(vnode, container) {
    // console.log(vnode, container)
    if (container._vnode && vnode) {
      // 更新
      patch(container._vnode, vnode, container)
      container._vnode = vnode
      return
    }
    // 首次渲染
    if (vnode) {
      mountElement(vnode, container)
      container._vnode = vnode
      return
    }
    if (container._vnode) {
      // 卸载
      container.innerHTML = ''
      delete container._vnode
    }
  }

  // @ts-ignore 服务端渲染、同构渲染、激活已有DOM
  function hydrate(vnode, container) {
    console.log(vnode, container)
  }

  return {
    render,
    hydrate
  }
}

export { createRenderer }
