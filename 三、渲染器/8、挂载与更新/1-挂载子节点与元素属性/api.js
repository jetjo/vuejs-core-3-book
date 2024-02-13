import { defArg0 } from '#root/utils'
import { RendererCreatorFactoryConfig } from '#utils'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  const __config = RendererCreatorFactoryConfig.init()
  /**@type {Required<typeof __config>} */ // @ts-ignore
  const config = Object.assign(__config, _config)
  /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
  if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')
  // 抽离特定于平台的API,将特定于平台的API视为配置项, 作为参数传入
  return function createRenderer({
    createElement,
    setElementText,
    setAttribute,
    addEventListener,
    insert
  }) {
    config.isVNodeArrayChildrenC ||= Array.isArray //&& children.every(child => typeof child === 'object')
    // @ts-ignore
    config.isVNodeChildAtomC_VVNode ||= child => {
      if (!child) return false
      if (typeof child !== 'object') return false
      if (config.isVNodeArrayChildrenC(child)) return false
      return true
    }
    config.mountChildren ||= function (children, container) {
      if (typeof children === 'string') {
        setElementText(container, children) //文本节点
        return
      }
      if (!config.isVNodeArrayChildrenC(children)) return // throw new Error('children is not array')
      children.forEach(child => {
        if (!config.isVNodeChildAtomC_VVNode(child)) return // throw new Error('child is not vnode')
        config.patch(null, child, container)
      })
    }

    config.mountProps ||= function (props, container) {
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

    /**@description 不负责维护`container.vnode`的值,由`config.render`维护 */
    config.mountElement ||= function (vnode, container) {
      const { type, props, children } = vnode
      if (typeof type !== 'string') throw new Error('type不是字符串')
      const ele = createElement(type)
      props && config.mountProps(props, ele)
      children && config.mountChildren(children, ele)
      insert(ele, container, null)
      // container.vnode = vnode //NOTE: 不负责维护`container.vnode`的值
      return ele
    }

    config.patch ||= function (oldVnode, vnode, container) {
      if (!oldVnode) {
        config.mountElement(vnode, container) // 挂载
        return
      }
      throw new Error('Not implemente~~~~~~~~~~~~~~~~~~~~!!!')
    }

    /**@type {typeof config['render']} */
    function render(vnode, container) {
      if (!RendererCreatorFactoryConfig.isAllDefined(config))
        throw new Error('config is not valid')
      if (!container) throw new Error('container is not exist')
      if (container.vnode && vnode) {
        config.patch(container.vnode, vnode, container) // 更新
        container.vnode = vnode
        return
      }
      if (vnode) {
        config.mountElement(vnode, container) // 首次渲染
        container.vnode = vnode
        return
      }
      if (container.vnode) {
        container.innerHTML = '' // 卸载
        delete container.vnode
      }
    }

    // @ts-ignore 服务端渲染、同构渲染、激活已有DOM
    function hydrate(vnode, container) {
      console.log(vnode, container)
    }

    return Object.assign(config, { render, hydrate, version: '8-1' })
    // NOTE: 不应返回一个解构的副本, 这样, 新版本更新的方法无法替换掉旧版本的了!!!
    // return {
    //   ...base,
    //   ...config,
    //   render,
    //   hydrate,
    //   version: '8-1' //放在`...config`后面,防止被覆盖
    // }
  }
}
export default factory
