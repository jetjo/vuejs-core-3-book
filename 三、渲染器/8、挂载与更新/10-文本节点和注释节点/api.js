import { RendererCreatorFactoryConfig, assertUnknownEx } from '#utils'
import { defArg0 } from '#root/utils'
import baseFactory from '../9-更新子节点/api.js'
import { Text, Comment } from '../../convention.js'

const VER = '8-10'

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
     * @description 1、当新节点是文本节点时打补丁或挂载
     * @description 2、当新节点是注释节点时只在控制台中打印
     * @description 3、当新节点是其他类型时交由`basePatch`处理
     * @description 以下是当前的限制:
     * @description 1、并且只支持`type`为`string`的节点以及文本和注释节点
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
      if (type === Text || type === Comment) {
        let el
        if (!vnode) el = MountCharacterNode(newVnode, container, anchor)
        else el = PatchCharacterNode(vnode, newVnode, anchor)
        // NOTE: 最后别忘了复用DOM
        newVnode.el = el
        return
      }
      basePatch(vnode, newVnode, container, anchor, testFlag)
    }

    /**
     * @param {string} content
     * @param {import('vue').VNodeTypes} type
     */
    const requireValidCharContent = (content, type) => {
      const isText = type === Text
      if (typeof content !== 'string') throw new Error(`${isText ? '文本' : '注释'}节点的children必须是字符串`) // prettier-ignore
      return true
    }

    // @ts-ignore
    function MountCharacterNode(vnode, container, anchor) {
      const { type } = vnode
      // if (type === Text || type === Comment) {
      assertUnknownEx(vnode.children, requireValidCharContent, type)
      const el = type === Text ? option.createText(vnode.children) : option.createComment(vnode.children) // prettier-ignore
      option.insert(el, container, anchor)
      // NOTE: 执行`config.mountElement`的赋值逻辑
      vnode.el = el
      return el
      // }
      // throw new Error('不是文本节点或注释节点')
    }

    // @ts-ignore
    function PatchCharacterNode(vnode, newVnode, anchor) {
      if(anchor) throw new Error('暂不支持在此处移动文本节点位置')
      const el = (newVnode.el = vnode.el)
      // if (el === null) throw new Error('节点已被卸载,无法进行patch操作')
      // if (el === undefined) throw new Error('挂载虚拟节点后,忘记了设置`el`属性')

      const { type } = newVnode
      // if (type === Text || type === Comment) {
      if (vnode.children === newVnode.children) return el

      assertUnknownEx(newVnode.children, requireValidCharContent, type)
      if (type === Text) option.setText(el, newVnode.children)
      else option.setComment(el, newVnode.children)
      return el
      // }

      // throw new Error('不是文本节点或注释节点')
    }

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
