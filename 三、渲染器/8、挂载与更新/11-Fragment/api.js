import { RendererCreatorFactoryConfig } from '#utils'
import { defArg0, warn } from '#root/utils'
import baseFactory from '../10-文本节点和注释节点/api.js'
import { Fragment } from '../../convention.js'

const VER = '8-11'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    const basePatch = config.patch
    /**
     * @description 目前实现三个目标:
     * @description 1、当新节点`Fragment`时打补丁或挂载
     * @description 2、当新节点是其他类型时交由`basePatch`处理
     * @description 以下是当前的限制:
     * @description 1、支持`type`为`string`、`Text`,`Comment`,`Fragment`的节点
     * @description 2、`vnode.type`的值需要分多种情况处理, type是字符串代表原生标签, type是对象代表组件等等
     */
    config.patch = function (vnode, newVnode, container, anchor) {
      if (!newVnode) throw new Error('newVnode不存在. patch操作不负责卸载节点!')
      if (vnode && vnode.type !== newVnode.type) {
        config.unmount(vnode)
        vnode = null
      }
      const { type } = newVnode
      const testFlag = arguments[4]
      if (type === Fragment) {
        if (!config.isVNodeArrayChildrenC(newVnode.children)) throw new Error('Fragment的children字段必须是数组') // prettier-ignore
        if (!vnode) {
          newVnode.children.forEach(child => {
            if (!config.isVNodeChildAtomC_VVNode(child)) throw new Error('Fragment的children必须是VNode类型') // prettier-ignore
            config.patch(null, child, container, anchor, testFlag)
          })
          return
        }
        config.patchChildren(vnode, newVnode, container, testFlag)
        return
      }
      basePatch(vnode, newVnode, container, anchor, testFlag)
    }

    config.render = function (vnode, container) {
      if (!RendererCreatorFactoryConfig.isAllDefined(config)) throw new Error('config is not valid') // prettier-ignore
      if (!container) throw new Error('container is not exist')

      const testFlag = arguments[2]
      if (vnode) {
        // if (container.vnode && vnode) {
        config.patch(container.vnode, vnode, container, null, testFlag) // 更新
        container.vnode = vnode
        return
      }
      // if (!container.vnode && vnode) {
      //   // NOTE: vue并没有在只有新节点时直接调用`mountElement`!!!!!!!!, 而是
      //   // 只要有新节点就调用`patch`方法, 由`patch`方法判断是否是初次挂载
      //   config.mountElement(vnode, container, testFlag) // 首次渲染
      //   container.vnode = vnode
      //   return
      // }
      // if (!container.vnode) throw new Error('container.vnode不存在')
      if (container.vnode) {
        // 卸载 // NOTE: 这样卸载,有很多不足:
        // // 1、如果`container`的一些子节点是由`Vue`组件渲染的,需要调用生命周期的相关钩子, 例如`unmounted`
        // // 2、如果一些节点关联了`Vue`的自定义指令,需要调用相关的钩子,例如`unmounted`
        // // 3、仅清空`innerHTML`,也无法移除绑定在节点上的事件监听器
        // container.innerHTML = ''、
        // delete container.vnode
        config.unmount(container.vnode)
        container.vnode = null
      }
    }

    const baseUmount = config.unmount
    config.unmount = function (vnode) {
      if (!vnode) return
      if (vnode.type === Fragment) {
        // @ts-ignore
        warn([vnode.children[0], vnode.children[1]], '卸载Fragment')
        if(!config.isVNodeArrayChildrenC(vnode.children)) throw new Error('Fragment的children字段必须是数组') // prettier-ignore
        vnode.children.forEach(child => {
          if(!config.isVNodeChildAtomC_VVNode(child)) throw new Error('Fragment的children必须是VNode类型') // prettier-ignore
          config.unmount(child)
        })
        return
      }
      baseUmount(vnode)
    }

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
