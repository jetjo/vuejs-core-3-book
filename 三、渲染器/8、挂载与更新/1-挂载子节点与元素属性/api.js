import { defArg0 } from '#root/utils'
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
  return function createRenderer({
    createElement,
    setElementText,
    setAttribute,
    insert,
    patchProps
  }) {
    config.isVNodeArrayChildrenC = Array.isArray //&& children.every(child => typeof child === 'object')
    // @ts-ignore
    config.isVNodeChildAtomC_VVNode = child => {
      if (!child) return false
      if (typeof child !== 'object') return false
      if (config.isVNodeArrayChildrenC(child)) return false
      return true
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
      const el = createElement(type)
      const mountProps = () => {
        for (const key in props) {
          // if (Object.hasOwnProperty.call(props, key)) {}
          patchProps(el, key, null, props[key])
        }
      }
      props && mountProps()
      const mountChildren = () => {
        if (typeof children === 'string') {
          setElementText(el, children) //文本节点
          // container.vnode = children ???
          return
        }
        if (!config.isVNodeArrayChildrenC(children)) throw new Error('children is not array') // prettier-ignore
        children.forEach(child => {
          if (!config.isVNodeChildAtomC_VVNode(child)) throw new Error('child is not vnode') // prettier-ignore
          config.patch(null, child, el)
          // container.vnode = children ???
        })
      }
      children && mountChildren()
      insert(el, container, null)
      // container.vnode = vnode //NOTE: 不负责维护`container.vnode`的值
      return el
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

    // @ts-ignore
    function render(vnode, container) {
      if (!RendererCreatorFactoryConfig.isAllDefined(config)) throw new Error('config is not valid') // prettier-ignore
      if (!container) throw new Error('container is not exist')

      const testFlag = arguments[2]
      if (testFlag) {
        console.warn(
          {
            vnode,
            containerInnerHTML: container.innerHTML,
            containerSame: container.vnode === vnode,
            body: document.body.innerHTML,
            container
          },
          testFlag,
          VER
        )
      }

      if (vnode) {
        // if (container.vnode && vnode) {
        // warn('patch', VER, 'render', arguments[2])
        // @ts-ignore
        config.patch(container.vnode, vnode, container, testFlag) // 更新
        container.vnode = vnode
        return
      }
      // if (vnode) {
      //   // NOTE: / vue并没有这样, 而是和上个分支一样处理, 调用`patch`方法
      //   config.mountElement(vnode, container, testFlag) // 首次渲染
      //   container.vnode = vnode
      //   return
      // }
      if (container.vnode) {
        container.innerHTML = '' // 卸载
        delete container.vnode
      }
    }

    setValOfFnType(config, 'render', render)

    setValOfFnType(config, 'hydrate')

    setValOfFnType(config, 'patchElement')

    setValOfFnType(config, 'patchChildren')

    setValOfFnType(config, 'unmount')

    setValOfFnType(config, 'unmountChildren')

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
