import { effect, reactive, shallowReactive } from '#vue-fixed/reactive'
import { scheduler } from '@jetjo/vue3/effect'
import { getValOfFnType } from '@jetjo/vue3-chapter3/utils'
import factory from '../3-组件实例与生命周期/api.js'
import { warn } from 'vue'

const VER = '4-4-0'

/**@type {typeof factory} */
const factory2 = option => {
  const config = factory(option)

  config.resolveProps = function (options, propsData) {
    /**@type {import('#shims').Data[]} */
    const res = [{}, {}]
    const p = res[0]
    const a = res[1]
    for (const key in propsData) {
      if (key in options) {
        p[key] = propsData[key]
        continue
      }
      a[key] = propsData[key]
    }
    return res
  }

  config.patchComponent = function (vnode, newVnode, anchor) {
    if (!vnode) throw new Error('vnode 不存在!')
    if (typeof newVnode.type === 'function') throw new Error('暂不支持的组件类型!')
    const instance = (newVnode.component = vnode.component)
    if (!instance) throw new Error('instance 不存在!')
    if (!config.hasPropsChanged(vnode.props || {}, newVnode.props || {})) return
    const { props } = instance
    const [nextProps] = config.resolveProps(newVnode.type.props, newVnode.props || {})
    for (const key in nextProps) {
      props[key] = nextProps[key]
    }
    for (const key in props) {
      if (!(key in nextProps)) delete props[key]
    }
  }

  config.hasPropsChanged = function (preProps, nextProps) {
    const nextKeys = Object.keys(nextProps)
    if (nextKeys.length !== Object.keys(preProps).length) return true
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i]
      if (preProps[key] !== nextProps[key]) return true
    }
    return false
  }

  config.createRenderContext = function (instance) {
    if (!instance) throw new Error('instance 不存在!')
    return new Proxy(instance, {
      get(target, key, receiver) {
        if (typeof key === 'symbol') throw new Error('不支持的操作!')
        const { data, props, attrs } = target
        // @ts-ignore
        const state = target.state
        if (data && key in data) return data[key]
        if (state && key in state) return state[key]
        if (key in props) return props[key]
        if (key in attrs) return attrs[key]
        warn(`无法获取 ${String(key)} 属性!`)
      },
      set(target, key, value, receiver) {
        if (typeof key === 'symbol') throw new Error('不支持的操作!')
        // @ts-ignore
        const { data, props, attrs } = target
        // @ts-ignore
        const state = target.state
        if (data && key in data) return (data[key] = value)
        if (state && key in state) return (state[key] = value)
        warn(`无法设置 ${String(key)} 属性!`)
        return true
      }
    })
  }

  /**@type {typeof config.mountComponent} */
  function mountComponent(vnode, container, anchor) {
    const Com = vnode.type
    if (typeof Com === 'function') throw new Error('暂不支持的组件类型!')
    // prettier-ignore
    const { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = Com
    if (typeof render !== 'function') throw new Error('组件缺少 render 函数!')
    const propsOption = Com.props

    beforeCreate && beforeCreate()

    let state = {}
    if (typeof data === 'function') {
      state = reactive(data(null) || {})
    }

    const [props, attrs] = config.resolveProps(propsOption, vnode.props || {})

    const instance = {
      state,
      data: state,
      isMounted: false,
      subTree: null,
      props: shallowReactive(props),
      attrs: shallowReactive(attrs)
    }

    // @ts-ignore
    vnode.component = instance

    const context = config.createRenderContext(vnode.component)

    // 使用`call`将上下文绑定为`context`
    created && created.call(context)

    effect(
      () => {
        const subTree = render.call(context, context)
        if (!instance.isMounted) {
          beforeMount && beforeMount.call(context)
          getValOfFnType(config, 'patch')(null, subTree, container, anchor)
          instance.isMounted = true
          mounted && mounted.call(context)
        } else {
          beforeUpdate && beforeUpdate.call(context)
          getValOfFnType(config, 'patch')(instance.subTree, subTree, container, anchor)
          updated && updated.call(context)
        }
        instance.subTree = subTree
      },
      {
        scheduler
      }
    )
  }

  config.mountComponent = mountComponent

  config.version = VER
  return config
}

factory2.version = VER

export default factory2
