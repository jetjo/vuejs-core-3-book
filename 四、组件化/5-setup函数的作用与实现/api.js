// @ts-ignore
import { effect, reactive, shallowReactive } from '#vue-fixed/reactive'
import { scheduler } from '@jetjo/vue3/effect'
import { getValOfFnType } from '@jetjo/vue3-chapter3/utils'
import factory from '../4-props与组件的被动更新/api.js'
import { warn } from 'vue'
import { createComponentInstance, setupComponent } from './component.js'

const VER = '4-5-0'

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

    const instance = (vnode.component = createComponentInstance(vnode, null))

    // @ts-ignore
    setupComponent(instance)

    const render = Com.render
    if (typeof render !== 'function') throw new Error('组件缺少 render 函数!')
    // // prettier-ignore
    // const { render, data, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated } = Com
    // const propsOption = Com.props

    // // https://vuejs.org/api/options-lifecycle.html#beforecreate
    // // 根据上述链接, 对于属性的处理是在`beforeCreate`钩子函数之前的
    // const [props, attrs] = config.resolveProps(propsOption, vnode.props || {})

    // const createPubInstance = {}
    // const $data = data ? data.call(createPubInstance, createPubInstance) : {}
    // createPubInstance.$data = $data

    // // https://vuejs.org/api/options-lifecycle.html#beforecreate
    // // 根据上述链接, `beforeCreate` 钩子函数在实例初始化之后, 处理`data`之前调用
    // const pubInstance = { ...createPubInstance }
    // beforeCreate && beforeCreate.call(pubInstance)

    // /**@type {Partial<NonNullable<typeof vnode.component>>} */
    // const _instance = {
    //   props: shallowReactive(props),
    //   attrs: shallowReactive(attrs),
    //   state: reactive($data),
    //   data: reactive($data),
    //   isMounted: false,
    //   // subTree: null
    // }
    // Object.assign(instance, _instance)

    // @ts-ignore
    vnode.component = instance

    const context = config.createRenderContext(vnode.component)

    // // 使用`call`将上下文绑定为`context`
    // created && created.call(context)

    effect(
      () => {
        const subTree = render.call(context, context)
        if (!instance.isMounted) {
          // beforeMount && beforeMount.call(context)
          getValOfFnType(config, 'patch')(null, subTree, container, anchor)
          instance.isMounted = true
          // mounted && mounted.call(context)
        } else {
          // beforeUpdate && beforeUpdate.call(context)
          getValOfFnType(config, 'patch')(instance.subTree, subTree, container, anchor)
          // updated && updated.call(context)
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
