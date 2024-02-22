import { effect, reactive } from '#vue-fixed/reactive'
import { scheduler } from '@jetjo/vue3/effect'
import factory from '../1-渲染组件/api.js'
import { getValOfFnType } from '@jetjo/vue3-chapter3/utils'

const VER = '4-2-0'

/**@type {typeof factory} */
const factory2 = option => {
  const config = factory(option)

  /**@type {typeof config.mountComponent} */
  // @ts-ignore
  function mountComponent(vnode, container, anchor) {
    const com = vnode.type
    if (typeof com === 'function') throw new Error('暂不支持的组件类型!')
    const { render, data } = com
    if (typeof render !== 'function') throw new Error('组件缺少 render 函数!')
    // if (typeof data !== 'function') throw new Error('组件缺少 data 函数!')
    // const state = typeof data !== 'function' ? {} : reactive(data(null))
    let state = {}
    if (typeof data === 'function') {
      state = reactive(data(null) || {})
    }

    effect(
      () => {
        const subTree = render.call(state, state)
        getValOfFnType(config, 'patch')(null, subTree, container, anchor)
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
