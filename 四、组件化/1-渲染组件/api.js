import { warn } from '#root/utils'
import { factory } from '@jetjo/vue3-chapter3'

const VER = '4-1-0'

/**
 * @template ET
 * @template {ET} HN
 * @template {HN} Ele
 * @template {HN} ParentN
 * @template {Ele} EleNS
 * @template {HN} Doc
 * @param {import('#shims').RendererConfig<ET, HN, Ele, ParentN, EleNS, Doc>} option
 * @returns {import('#shims').RendererEx4<HN, Ele>}
 * */
const factory2 = function (option) {
  /**@type {import('#shims').RendererEx4<HN, Ele>} */
  // @ts-ignore
  const config = factory(option)

  // @ts-ignore
  config.isComponentVNode = vnode => {
    return typeof vnode.type === 'object'
  }

  const basePath = config.patch
  config.patch = (vnode, newVnode, container, anchor) => {
    if (!newVnode) throw new Error('newVnode is required')
    if (!container) throw new Error('container is required')
    if (vnode && vnode.type !== newVnode.type) {
      config.unmount(vnode)
      vnode = null
    }
    if (config.isComponentVNode(newVnode)) {
      if (!vnode) {
        config.mountComponent(newVnode, container, anchor)
        return
      }
      if (config.isComponentVNode(vnode)) config.patchComponent(vnode, newVnode, anchor)
      else throw new Error('vnode is not a component')
      return
    }
    basePath(vnode, newVnode, container, anchor)
  }

  config.mountComponent = (newVnode, container, anchor) => {
    const com = newVnode.type
    if (typeof com === 'function') throw new Error('暂不支持的组件类型')
    const { render } = com
    if (!render) throw new Error('render is required')
    const subTree = render()
    config.patch(null, subTree, container, anchor)
  }

  config.version = VER
  warn('factory', VER, config)
  return config
}

factory2.version = VER

export default factory2
