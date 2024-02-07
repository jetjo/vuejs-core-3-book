// 抽离特定于平台的API
// 将特定于平台的API视为配置项, 作为参数传入
/**
 * @param {import('./api-c.d.ts').RendererConfig} options 
 */
function createRenderer({createElement, setElementText, insert}) {

  // 将vdom node挂载到配置指定的平台
  function mountElement(vnode, container) {
    const { type, props, children } = vnode
    const el = createElement(type)
    if (typeof children === 'string') {
      // 文本节点
      setElementText(el, children)
    }
    insert(el, container, null)
  }

  function patch(oldVnode, vnode, container) {
    console.log(oldVnode, vnode, container)
  }

  function render(vnode, container) {
    console.log(vnode, container)
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

  // 服务端渲染、同构渲染、激活已有DOM
  function hydrate(vnode, container) {
    console.log(vnode, container)
  }

  return {
    render,
    hydrate
  }
}

export { createRenderer }
