import { warn } from '#root/utils'
import { getValOfFnType, setValOfFnType } from '#utils'

const VER = '8-1'
/**
 * @template ET
 * @template {ET} HN
 * @template {HN} Ele
 * @template {HN} ParentN
 * @template {Ele} EleNS
 * @template {HN} Doc
 * @type {import('#shims').RendererFactory<ET, HN, Ele, ParentN, EleNS, Doc>} */
const factory = function (option) {
  /**@type {ReturnType<typeof factory>} */
  const config = {
    // @ts-ignore
    __proto__: null,
    // mountChildren: undefined,
    // unmountChildren: undefined,
    // mountProps: undefined,
    // mountElement: undefined,
    // unmount: undefined,
    // patchElement: undefined,
    // patchChildren: undefined,
    // patchKeyedChildren: undefined,
    // patchKeyedChildrenQk: undefined,
    // requireKeyedChildren: undefined,
    // handleChildAdd: undefined,
    // handleChildRemove: undefined,
    // patch: undefined,
    // isVNodeArrayChildrenC: undefined,
    // isVNodeChildAtomC_VVNode: undefined,
    // @ts-ignore
    render: undefined,
    hydrate: () => {
      throw new Error('hydrate is not implemented')
    }
  }

  const { createElement, setElementText, setAttribute, insert, patchProps } = option
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

  /**@type {ReturnType<typeof factory>['mountElement']} */
  config.mountElement = function (vnode, container, anchor) {
    const { type, props, children } = vnode
    if (typeof type !== 'string') throw new Error('type不是字符串')
    // NOTE: 如果`vnode.el`存在, 说明该节点已经被挂载过, 直接返回???
    // const el = vnode.el || createElement(type)
    const el = createElement(type)
    const mountProps = () => {
      for (const key in props) {
        // if (Object.hasOwnProperty.call(props, key)) {}
        patchProps.call(option, el, key, null, props[key])
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
        config.patch(null, child, el, null)
        // container.vnode = children ???
      })
    }
    children && mountChildren()
    insert(el, container, anchor)
    // container.vnode = vnode //NOTE: 不负责维护`container.vnode`的值
    return el
  }

  // @ts-ignore // 新版本的`patch`功能完全覆盖了此版本, 所以这里断开与``config.patch``的继承关系
  // config.patch ||= function (oldVnode, vnode, container) {
  function patch(oldVnode, vnode, container) {
    if (!oldVnode) {
      getValOfFnType(config, 'mountElement')(vnode, container) // 挂载
      return
    }
    throw new Error('Not implemented yet!🤬🤬🤬')
  }

  setValOfFnType(config, 'patch', patch)

  // @ts-ignore
  function render(vnode, container) {
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
      config.patch(container.vnode, vnode, container, null, testFlag) // 更新
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
  setValOfFnType(config, 'patchKeyedChildren')
  setValOfFnType(config, 'patchKeyedChildrenQk')
  setValOfFnType(config, 'requireKeyedChildren')
  setValOfFnType(config, 'handleChildAdd', null, '暂不支持新增子节点')
  setValOfFnType(config, 'handleChildRemove', null, '暂不支持删除子节点')

  setValOfFnType(config, 'unmount')

  warn('factory', VER, config)

  return Object.assign(config, { version: VER })
}

factory.version = VER

export default factory
