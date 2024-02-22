import { effect, reactive } from '#vue-fixed/reactive'
import { scheduler } from '@jetjo/vue3/effect'
import { getValOfFnType } from '@jetjo/vue3-chapter3/utils'
import factory from '../2-组件状态与自更新/api.js'

const VER = '4-3-0'

/**@type {typeof factory} */
const factory2 = option => {
  const config = factory(option)

  /**@type {typeof config.mountComponent} */
  // @ts-ignore
  function mountComponent(vnode, container, anchor) {
    const Com = vnode.type
    if (typeof Com === 'function') throw new Error('暂不支持的组件类型!')
    // prettier-ignore
    const { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = Com
    if (typeof render !== 'function') throw new Error('组件缺少 render 函数!')

    beforeCreate && beforeCreate()

    let state = {}
    if (typeof data === 'function') {
      state = reactive(data(null) || {})
    }

    const instance = {
      state,
      isMounted: false,
      subTree: null
    }

    // @ts-ignore
    vnode.component = instance
    // 使用`call`将上下文绑定为`state`
    created && created.call(state)

    effect(
      () => {
        const subTree = render.call(state, state)
        if (!instance.isMounted) {
          beforeMount && beforeMount.call(state)
          getValOfFnType(config, 'patch')(null, subTree, container, anchor)
          instance.isMounted = true
          mounted && mounted.call(state)
        } else {
          beforeUpdate && beforeUpdate.call(state)
          getValOfFnType(config, 'patch')(instance.subTree, subTree, container, anchor)
          updated && updated.call(state)
        }
        instance.subTree = subTree
      },
      {
        scheduler
      }
    )
  }

  // config.mountComponent = mountComponent

  config.version = VER
  return config
}

factory2.version = VER

export default factory2
