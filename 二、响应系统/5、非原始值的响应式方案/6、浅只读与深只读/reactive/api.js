/* @4-4 [分支切换与cleanup] */
/* @4-6 [无限递归循环] */
/* @4-7 [调度执行] */
/* @4-7-1 [副作用列队与中间态] */
/* @4-9 [深度响应] */
/* @4-9-1 [对象成员遍历、添加、删除时依赖收集与effect触发] */
import { Effect } from '#effect/4-11.js'
import { trigger, track } from '#reactive/t-t/4-11.js'
import { throwErr, warn } from '#utils'
import {
  requireReactiveTarget,
  createProxyHandler,
  setReactiveApiFlag
} from './traps/helper.js'
import { trapGetters as defaultTrapGetters } from './traps/index.js'
import { isReactive, reactiveFlagChecker } from './traps/convention.js'
import getReactive from './traps/Reactive.js'
import { withRecordTrapOption } from '#reactive/traps/option.js'

/**@typedef {import('./index.js').ProxyTrapGetter} ProxyTrapGetter*/
/**@typedef {import('./index.js').ProxyTrapOption} ProxyTrapOption*/

function factory({ version, isShallow, isReadonly }) {
  /** @NOTE: 
  `shallowReactive`、`reactive`、`shallowReadonly`和`readonly`
  4个api用的不是同一个集合,
  但是内部和外部api是同一个集合,
  所以需要在`createReactive`内且`__getApi`外声明 ;
  @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index.vue |GitHub-learn-vue项目 }
  */
  const reactiveMap = new WeakMap()
  /**@type {TrapGetter<>[]} */
  let trapGetters = [...defaultTrapGetters]
  /**@type {ProxyTrapOption} */
  let trapOption = {
    isShallow,
    isReadonly,
    Effect,
    track,
    trigger,
    version
  }

  function isExpectedReactive(reactive, hasReactiveFlag = false) {
    return reactiveFlagChecker.isExpected(
      reactive,
      isShallow,
      isReadonly,
      hasReactiveFlag
    )
  }

  let getProxyHandler
  let proxyHandler
  function reactiveApi(callFromSelfTrap = false) {
    const api = function (target) {
      if (!callFromSelfTrap) {
        requireReactiveTarget(target)
        if (isReactive(target)) {
          /**
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2.vue |GitHub-learn-vue项目 }
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-2.vue |GitHub-learn-vue项目 }
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-3.vue |GitHub-learn-vue项目 }
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-4.vue |GitHub-learn-vue项目 }
           */
          if (isExpectedReactive(target, true)) {
            warn('参数target不能是reactive的返回值类型!')
            return target
          }
          // target可能仍然是响应式数据. v并没有这样, 而是再次包裹了一层Proxy
          // target = getTarget(target, true)
        }
      }
      // 解决当对象属性是引用类型时,对属性的两次读取结果不一致的问题
      // 二、响应系统/5、非原始值的响应式方案/7、代理数组/includes.js
      // https://github.com/jetjo/vuejs-core-3-book/blob/master/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E7%B3%BB%E7%BB%9F/5%E3%80%81%E9%9D%9E%E5%8E%9F%E5%A7%8B%E5%80%BC%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F%E6%96%B9%E6%A1%88/7%E3%80%81%E4%BB%A3%E7%90%86%E6%95%B0%E7%BB%84/includes.js
      if (reactiveMap.has(target)) return reactiveMap.get(target)
      // const py = new Proxy(target, handler)
      const py = new Proxy(target, getProxyHandler())
      reactiveMap.set(target, py)
      return py
    }
    setReactiveApiFlag(api, { isShallow, isReadonly, version })
    return api
  }

  Object.assign(trapOption, {
    reactive: !isShallow && !isReadonly ? reactiveApi(true) : undefined,
    readonly: !isShallow && isReadonly ? reactiveApi(true) : undefined,
    Reactive: getReactive(trapOption)
  })

  /**@type {Reactive} */
  let api
  /**@type {ReactiveApiCreator} */
  const getApi = () => {
    if (api !== undefined) return api
    getProxyHandler = getApi.getProxyHandler
    // delete getApi.getProxyHandler
    return (api = reactiveApi())
  }

  getApi.getProxyHandler = () => {
    if (api === undefined) throwErr('配置异常!')
    if (getProxyHandler === undefined) throwErr('配置异常!')
    // if (getApi.getProxyHandler !== undefined) throwErr('配置异常!')
    if (proxyHandler !== undefined) return proxyHandler
    const traps = []
    trapGetters.forEach(getter => traps.push(getter(trapOption)))
    return (proxyHandler = createProxyHandler(traps))
  }

  Object.defineProperty(getApi, 'trapGetters', {
    get() {
      return [...trapGetters]
    },
    set(value) {
      if (proxyHandler !== undefined) throwErr('配置异常!')
      if (!Array.isArray(value)) throwErr('参数必须是数组!')
      trapGetters = [...trapGetters, ...value]
    },
    enumerable: true
  })
  Object.defineProperty(getApi, 'trapOption', {
    get() {
      return { ...trapOption }
    },
    set(value) {
      if (proxyHandler !== undefined) throwErr('配置异常!')
      trapOption = { ...trapOption, ...value }
    },
    enumerable: true
  })
  Object.defineProperty(getApi, 'isExpectedReactive', {
    value: isExpectedReactive,
    enumerable: true
  })

  return getApi
}

/**@type {CreateReactive} */
function createReactive(
  isShallow = false,
  isReadonly = false,
  version = '5-6'
) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'createReactive'
  })
}

export { createReactive }
