import { defArg0, warn } from '#root/utils'
import { RendererCreatorFactoryConfig, setValOfFnType } from '#utils'

const VER = '8-1'
/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  const __config = RendererCreatorFactoryConfig.init()
  /**@type {Required<typeof __config>} */ // @ts-ignore
  const config = Object.assign(__config, _config)
  /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
  if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')
  // 抽离特定于平台的API,将特定于平台的API视为配置项, 作为参数传入
  return function createRenderer({ createElement, setElementText, setAttribute, insert }) {
    config.isVNodeArrayChildrenC = Array.isArray //&& children.every(child => typeof child === 'object')
    // @ts-ignore
    config.isVNodeChildAtomC_VVNode = child => {
      if (!child) return false
      if (typeof child !== 'object') return false
      if (config.isVNodeArrayChildrenC(child)) return false
      return true
    }
    config.mountChildren = function (children, container) {
      if (typeof children === 'string') {
        setElementText(container, children) //文本节点
        return
      }
      if (!config.isVNodeArrayChildrenC(children)) throw new Error('children is not array') // prettier-ignore
      children.forEach(child => {
        if (!config.isVNodeChildAtomC_VVNode(child)) throw new Error('child is not vnode') // prettier-ignore
        config.patch(null, child, container)
      })
    }

    // @ts-ignore // 有新版本
    function mountProps(props, container) {
      for (const key in props) {
        // if (Object.hasOwnProperty.call(props, key)) {}
        const element = props[key]

        // 暂不处理, 由`patchProps`处理
        if (key.startsWith('on') && typeof element === 'function') throw new Error('暂不处理') // prettier-ignore

        // 设置属性, 有多种方式: setAttribute, 直接设置, 通过特定的方法设置
        // 1. 通过setAttribute方法设置
        setAttribute && setAttribute(container, key, element)
        // 2. 通过元素对象的属性设置
        // container[key] = element
        // 3. 通过特定的方法设置...
        // 不同的方式使用不同的情形,有不同的性能,目前暂不处理
      }
    }
    setValOfFnType(config, 'mountProps', mountProps)

    config.mountElement = function (vnode, container) {
      const { type, props, children } = vnode
      if (typeof type !== 'string') throw new Error('type不是字符串')
      const ele = createElement(type)
      props && config.mountProps(props, ele)
      children && config.mountChildren(children, ele)
      insert(ele, container, null)
      if (arguments[2]) {
        console.warn(
          {
            vnode,
            containerInnerHTML: container.innerHTML,
            containerSame: container.vnode === vnode,
            body: document.body.innerHTML,
            containerOut: container.outerHTML,
            isInBody: document.body.contains(container)
          },
          arguments[2],
          VER,
          'mountElement'
        )
      }
      // container.vnode = vnode //NOTE: 不负责维护`container.vnode`的值
      return ele
    }

    // @ts-ignore // 新版本的`patch`功能完全覆盖了此版本, 所以这里断开与``config.patch``的继承关系
    // config.patch ||= function (oldVnode, vnode, container) {
    function patch(oldVnode, vnode, container) {
      if (!oldVnode) {
        config.mountElement(vnode, container) // 挂载
        return
      }
      throw new Error('Not implemented yet!🤬🤬🤬')
    }

    setValOfFnType(config, 'patch', patch)

    config.render = function (vnode, container) {
      if (!RendererCreatorFactoryConfig.isAllDefined(config)) throw new Error('config is not valid') // prettier-ignore
      if (!container) throw new Error('container is not exist')

      if (arguments[2]) {
        console.warn(
          {
            vnode,
            containerInnerHTML: container.innerHTML,
            containerSame: container.vnode === vnode,
            body: document.body.innerHTML,
            container
          },
          arguments[2],
          VER
        )
      }

      if (container.vnode && vnode) {
        // warn('patch', VER, 'render', arguments[2])
        // @ts-ignore
        config.patch(container.vnode, vnode, container, arguments[2]) // 更新
        container.vnode = vnode
        return
      }
      if (vnode) {
        config.mountElement(vnode, container, arguments[2]) // 首次渲染
        container.vnode = vnode
        return
      }
      if (container.vnode) {
        container.innerHTML = '' // 卸载
        delete container.vnode
      }
    }

    setValOfFnType(config, 'hydrate')

    return Object.assign(config, { version: VER })
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
factory.version = VER
export default factory
