// @ts-check
import { RendererCreatorFactoryConfig } from '#utils'
import { defArg0 } from '#root/utils'
import baseFactory from '../5-卸载操作/api.js'

/**@type {typeof baseFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    /**
     * @description 目前只实现两个目标:
     * @description 1、当`vnode`不存在,并且`newVnode`存在时,完成初次挂载
     * @description 2、新旧节点`type`不同时,没有`patch`的必要,需要完全替换节点; 先卸载旧节点,再挂载新节点
     * @description 以下是当前的限制:
     * @description 1、并且只支持`type`为`string`的节点
     * @description 2、`vnode.type`的值需要分多种情况处理, type是字符串代表原生标签, type是对象代表组件等等
     * @description 3、不负责维护`container.vnode`的值
     */
    config.patch = function (vnode, newVnode, container) {
      if (!newVnode) throw new Error('newVnode不存在. patch操作不负责卸载节点!')
      if (typeof newVnode.type !== 'string') throw new Error('type不是字符串')
      
      const mountEle = () => {
        config.mountElement(newVnode, container)
        // container.vnode = newVnode // NOTE: 不负责维护`container.vnode`的值
        return newVnode //.el
      }
      if (!vnode) return mountEle()
      if (vnode.type !== newVnode.type) {
        config.unmount(vnode)
        return mountEle()
      }
      // ...剩余情形: 新旧节点都存在,且`type`相同,需要`patch`操作, 目前未实现
    }

    return Object.assign(config, { version: '8-6' })
  }
}

export default factory
