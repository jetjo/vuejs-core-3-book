// @ts-check
import { RendererCreatorFactoryConfig } from '#utils'
import { defArg0 } from '#root/utils'
import baseFactory from '../3-正确地设置元素属性/api.js'

const VER = '8-5'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    const baseMount = config.mountElement

    config.mountElement = function (vnode, container) {
      // throw new Error('unmount is not implemented')
      const el = baseMount(vnode, container, arguments[2])
      vnode.el = el
      return el
    }

    config.unmount = function (vnode) {
      if (!vnode.el) return
      const parent = vnode.el.parentNode
      if (!parent) return
      parent.removeChild(vnode.el)
    }

    // @ts-ignore
    function render(vnode, container) {
      // NOTE: `document`是特定平台的, 不能在此判断!!!
      const testFlag = arguments[2]
      if (container && !document.body.contains(container)) {
        console.error(arguments)
        throw new Error(
          `节点(${container.outerHTML})没有挂载到页面上!!!, body: ${document.body.innerHTML}`
        )
      }

      // console.error({ vnode, container })
      if (!RendererCreatorFactoryConfig.isAllDefined(config)) throw new Error('config不合法') // prettier-ignore
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

    // NOTE: 不应返回一个解构的副本, 这样, 新版本更新的方法无法替换掉旧版本的了!!!
    // return {
    //   ...config,
    //   render,
    //   version: '8-5' //放在`...config`后面,防止被覆盖
    // }
  }
}

factory.version = VER

export default factory
