import baseFactory from '../1-挂载子节点与元素属性/t.js'

const VER = '8-5'

/**@type {typeof baseFactory} */
const factory = function (option) {
  const config = baseFactory(option)

  const baseMount = config.mountElement

  config.mountElement = function (vnode, container, anchor) {
    // throw new Error('unmount is not implemented')
    const el = baseMount(vnode, container, anchor, arguments[3])
    vnode.el = el
    return el
  }

  config.unmount = function (vnode) {
    if (!vnode || !vnode.el) return
    // @ts-ignore
    const parent = vnode.el.parentNode
    if (!parent) return
    parent.removeChild(vnode.el)
  }

  // @ts-ignore
  function render(vnode, container) {
    // NOTE: `document`是特定平台的, 不能在此判断!!!
    if (container && !document.body.contains(container)) {
      console.error(arguments)
      throw new Error(
        `节点(${container.outerHTML})没有挂载到页面上!!!, body: ${document.body.innerHTML}`
      )
    }

    if (!container) throw new Error('container不存在')

    if (!vnode) {
      if (!container.vnode) throw new Error('container.vnode不存在')
      // 卸载 // NOTE: 这样卸载,有很多不足:
      // // 1、如果`container`的一些子节点是由`Vue`组件渲染的,需要调用生命周期的相关钩子, 例如`unmounted`
      // // 2、如果一些节点关联了`Vue`的自定义指令,需要调用相关的钩子,例如`unmounted`
      // // 3、仅清空`innerHTML`,也无法移除绑定在节点上的事件监听器
      // container.innerHTML = ''、
      config.unmount(container.vnode)
      container.vnode = null
      return
    }
    // 挂载、更新
    // config['render'](vnode, container, testFlag)
    container.vnode = vnode
  }

  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
