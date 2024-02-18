import { RendererCreatorFactoryConfig, assertUnknown } from '#utils'
import { defArg0 } from '#root/utils'
import baseFactory from '../5-新增节点/api.js'

const VER = '9-6'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    /**@param {Array<*>} arr */
    const requireArray = arr => {
      if (!Array.isArray(arr)) throw new Error('参数必须是数组!')
      return true
    }
    config.handleChildRemove = (newChildren, oldChildren) => {
      assertUnknown(newChildren, requireArray)
      assertUnknown(oldChildren, requireArray)
      let i = oldChildren.length
      while (i--) {
        const oldChild = oldChildren[i]
        if (!config.isVNodeChildAtomC_VVNode(oldChild)) throw new Error('oldChildren的元素必须是VNode类型') // prettier-ignore
        let find = false
        for (let j = newChildren.length; j--; ) {
          const newChild = newChildren[j]
          if (!config.isVNodeChildAtomC_VVNode(newChild)) throw new Error('newChildren的元素必须是VNode类型') // prettier-ignore
          if (oldChild.key === newChild.key) {
            find = true
            break
          }
        }
        if (!find) config.unmount(oldChild)
      }
    }

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
