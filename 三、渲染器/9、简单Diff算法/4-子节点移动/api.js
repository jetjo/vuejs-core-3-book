import { RendererCreatorFactoryConfig, assertUnknown } from '#utils'
import { defArg0 } from '#root/utils'
import baseFactory from '../../8、挂载与更新/11-Fragment/api.js'

const VER = '9-4'

/**@type {import('#shims').RendererCreatorFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    /* prettier-ignore */ // 标记config的所有字段都不是`undefined`
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    const basePatchChildren = config.patchChildren
    /**
     * @description 通过`简单Diff算法`更新子节点顺序
     * @description 暂不支持子节点的增删
     */
    config.patchChildren = function (vnode, newVnode, container) {
      if (!newVnode) throw new Error('newVnode不存在. patch操作不负责卸载节点!')
      const newChildren = newVnode.children
      const oldChildren = vnode.children
      const testFlag = arguments[3]
      if (Array.isArray(newChildren) && Array.isArray(oldChildren)) {
        assertUnknown(container, option.patchProps.isElement)
        let maxOldIndexOfFindNode = 0
        for (let newIndex = 0; newIndex < newChildren.length; newIndex++) {
          const newChild = newChildren[newIndex]
          if (!config.isVNodeChildAtomC_VVNode(newChild)) throw new Error('newChildren的元素必须是VNode类型') // prettier-ignore
          for (let oldIndex = 0; oldIndex < oldChildren.length; oldIndex++) {
            const oldChild = oldChildren[oldIndex]
            if (!config.isVNodeChildAtomC_VVNode(oldChild)) throw new Error('oldChildren的元素必须是VNode类型') // prettier-ignore
            if (newChild.key !== oldChild.key) continue
            // NOTE: if (newChild.type !== oldChild.type) continue???
            // 至此找到节点,先执行`patch`, 后处理移动的问题
            config.patch(oldChild, newChild, container, null, testFlag)
            // 如果此前以匹配到的节点的索引都比此节点小, 说明此节点与此前找到的节点们的次序没变,不需移动
            if (oldIndex > maxOldIndexOfFindNode) {
              // 然后更新查到的最大索引
              maxOldIndexOfFindNode = oldIndex
              break; //continue
            }
            // 否则, 说明此前找到的节点中,有的节点从此节点之后移动到了此节点之前, 需要移动此节点
            const preNewChild = newChildren[newIndex - 1]
            if (preNewChild) {
              if (!config.isVNodeChildAtomC_VVNode(preNewChild)) throw new Error('preNewChild必须是VNode类型') // prettier-ignore
              if (!preNewChild.el) throw new Error('preNewChild.el不存在')
              if (!newChild.el) throw new Error('newChild.el不存在')
              const anchor = preNewChild.el.nextSibling
              // 如果`anchor`是`null`,说明`preNewChild`是最后一个节点,直接插入到`container`中的末尾
              option.insert(newChild.el, container, anchor)
            }
            break
          }
        }
        return newVnode
      }
      return basePatchChildren(vnode, newVnode, container, testFlag)
    }

    return Object.assign(config, { version: VER })
  }
}
factory.version = VER
export default factory
