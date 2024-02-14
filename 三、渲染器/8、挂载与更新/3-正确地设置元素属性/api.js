// @ts-check
import { defArg0 } from '#root/utils'
import { RendererCreatorFactoryConfig } from '#utils'
import baseFactory from '../1-挂载子节点与元素属性/api.js'

/**@type {typeof baseFactory} */
function factory(_config = defArg0) {
  return function createRenderer(option) {
    /**@type {typeof _config} */
    const config = baseFactory(defArg0)(option)
    // prettier-ignore
    if (!RendererCreatorFactoryConfig.markAllDefined(config)) throw new Error('what???')

    const { patchProps, addEventListener: on } = option

    config.mountProps = function (props, container) {
      for (const key in props) {
        // if (Object.hasOwnProperty.call(props, key)) {}
        patchProps(container, key, null, props[key])
      }
    }

    return Object.assign(config, { version: '8-3' })

    // NOTE: 不应返回一个解构的副本, 这样, 新版本更新的方法无法替换掉旧版本的了!!!
    // return {
    //   ...config,
    //   version: '8-3'
    // }
  }
}

export default factory
