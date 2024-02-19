import { RendererCreatorFactoryConfig } from '#utils'
import { defArg0, warn } from '#root/utils'
import baseFactory from '../../10、双端Diff算法/5-删除元素/api.js'

const VER = '11-1'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    config.patchKeyedChildrenQk = (vnode, newVnode, container) => {
      let newChildren = newVnode.children || []
      let oldChildren = vnode.children || []
      if (newChildren.length === 0 && oldChildren.length === 0) {
        warn(`newChildren或oldChildren为空，不需要diff`)
        return newVnode
      }
      return newVnode
    }

    // @ts-ignore
    config.patchKeyedChildrenQk = null

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
