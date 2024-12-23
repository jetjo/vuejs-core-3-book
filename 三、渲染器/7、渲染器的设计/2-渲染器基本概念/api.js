// @ts-nocheck
function createRenderer() {
  function patch(oldVnode, vnode, container) {
    console.log(oldVnode, vnode, container)
  }
  function mountElement(vnode, container) {
    console.log(vnode, container)
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
