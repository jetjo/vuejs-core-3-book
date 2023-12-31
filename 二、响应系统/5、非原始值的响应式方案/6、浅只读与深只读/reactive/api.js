/* @4-4 [分支切换与cleanup] */
/* @4-6 [无限递归循环] */
/* @4-7 [调度执行] */
/* @4-7-1 [副作用列队与中间态] */
/* @4-9 [深度响应] */
/* @4-9-1 [对象成员遍历、添加、删除时依赖收集与effect触发] */
// import { api, shallowApi } from '../../3、代理Object/reactive/api.js'
import { Effect } from '../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/effect/index.js'
import {
  trigger,
  track
} from '../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/track-trigger.js'
import { runWithoutProto, warn } from '../../index.js'
import {
  requireReactiveTarget,
  doWithAllTrapGetter,
  // getTrapName,
  getProxyHandler
} from './traps/helper.js'
import * as trapsModule from './traps/index.js'
import {
  getTarget,
  isReactive,
  reactiveFlagChecker
} from './traps/convention.js'
import { getReactive } from './traps/Reactive.js'

let handleThrow = false
let handleProto = false

/**@typedef {import('./index.js').ProxyTrapGetter} ProxyTrapGetter*/
/**@typedef {import('./index.js').ProxyTrapOption} ProxyTrapOption*/

/**@type {ProxyTrapOption} */
const _trapOption = {
  __proto__: null,
  Effect,
  track: function () {
    // NOTE: 如果不使用runWithoutProto包裹track函数,
    // 在调试时,假如在track内部设置断点,
    // 当在浏览器开发者工具中在track内部中断后,
    // 把鼠标移到track的第一个参数target上,
    // 浏览器的开发者工具会展开target内容及其原型链上的内容,
    // 假如target的原型链上有被代理的原型(即reactive)
    // 这会导致target的原型的代理的ownKeys trap被执行,
    // 从而将当前被中断的effect作为对target原型的遍历操作(ITERATE_KEY)的被依赖者
    // 被收集到bucket中,给调试带来困惑😖
    runWithoutProto(arguments[0], () => track(...arguments))
  },
  // track,
  trigger,
  handleThrow,
  handleProto,
  getReactive
}

/**@type {ProxyTrapGetter[]} */
const _trapGetters = []

// /**@param {ProxyTrapGetter} trapGetter */
// _getApi.addTrapGetter = function (trapGetter) {
//   _trapGetters.push(trapGetter)
// }

/**@param {ProxyTrapOption} trapOption */
function _getProxyHandler(trapOption) {
  trapOption = {
    __proto__: null,
    ..._trapOption,
    ...trapOption
  }
  trapOption.Reactive = getReactive(trapOption)
  const trapGetters = []
  const traps = []
  const handleGetter = getter => {
    traps.push(getter(trapOption))
    trapGetters.push(getter)
  }
  doWithAllTrapGetter(trapsModule, handleGetter)
  _trapGetters.forEach(handleGetter)
  return {
    /* proxyHandler: getProxyHandler(traps), */ trapOption,
    trapGetters
  }
}

/**
 * @returns {{
 * (internalCall?: boolean): Reactive
 * addTrapBeforeCall(trapGetter: ProxyTrapGetter): void;
 * setTrapOption?: (opt?: ProxyTrapOption | undefined) => void;
 * }}
 */
function createReactive(isShallow = false, isReadonly = false) {
  // if (!isReadonly) return !isShallow ? api : shallowApi

  /** @NOTE: 
  `shallowReactive`、`reactive`、`shallowReadonly`和`readonly`
  4个api用的不是同一个集合,
  但是内部和外部api是同一个集合,
  所以需要在`createReactive`内且`__getApi`外声明 ;
  @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index.vue |GitHub-learn-vue项目 }
  */
  const reactiveMap = new WeakMap()

  function isExpectedReactive(reactive, internalCall = false) {
    return reactiveFlagChecker.isExpected(
      reactive,
      isShallow,
      isReadonly,
      internalCall
    )
  }

  const __getApi = function (internalCall = false) {
    return function (target) {
      if (!internalCall) {
        requireReactiveTarget(target)
        if (isReactive(target)) {
          warn('参数target不能是reactive的返回值类型!')
          /**
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2.vue |GitHub-learn-vue项目 }
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-2.vue |GitHub-learn-vue项目 }
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-3.vue |GitHub-learn-vue项目 }
           * @see {@link https://github.com/jetjo/learn-vue/blob/main/src/响应式数据/index2-4.vue |GitHub-learn-vue项目 }
           */
          if (isExpectedReactive(target, true)) return target
          // target可能仍然是响应式数据. v并没有这样, 而是再次包裹了一层Proxy
          // target = getTarget(target, true)
        }
      }
      // 解决当对象属性是引用类型时,对属性的两次读取结果不一致的问题
      // 二、响应系统/5、非原始值的响应式方案/7、代理数组/includes.js
      // https://github.com/jetjo/vuejs-core-3-book/blob/master/%E4%BA%8C%E3%80%81%E5%93%8D%E5%BA%94%E7%B3%BB%E7%BB%9F/5%E3%80%81%E9%9D%9E%E5%8E%9F%E5%A7%8B%E5%80%BC%E7%9A%84%E5%93%8D%E5%BA%94%E5%BC%8F%E6%96%B9%E6%A1%88/7%E3%80%81%E4%BB%A3%E7%90%86%E6%95%B0%E7%BB%84/includes.js
      if (reactiveMap.has(target)) return reactiveMap.get(target)
      // const py = new Proxy(target, handler)
      const py = new Proxy(target, __getApi.getProxyHandler())
      reactiveMap.set(target, py)
      return py
    }
  }

  /**@param {ProxyTrapGetter} trapGetter */
  __getApi.addTrapBeforeCall = function (trapGetter) {
    // const trap = trapGetter({ ...trapOpt })
    // const trapName = getTrapName(trap)
    // if (!trapName) return
    // handler[trapName] = trap
    trapGetters.push(trapGetter)
  }

  /**@param {ProxyTrapOption} [opt] */
  __getApi.setTrapOption = function (opt = {}) {
    for (const [key, value] of Object.entries(opt)) {
      trapOpt[key] = value
    }
  }

  function _getTrapOption(trapOption = {}) {
    trapOption = Object.assign(
      Object.create(null),
      _trapOption,
      trapOpt,
      trapOption
    )
    trapOption.Reactive = trapOption.getReactive(trapOption)
    return trapOption
  }
  __getApi.getTrapOption = _getTrapOption
  __getApi.getProxyHandler = function (trapOption = {}) {
    trapOption = _getTrapOption(trapOption)
    const traps = []
    trapGetters.forEach(getter => traps.push(getter(trapOption)))
    return getProxyHandler(traps)
  }

  // provideMethodToModule(reactive, reactiveReceivor)

  const {
    proxyHandler: handler,
    trapOption: trapOpt,
    trapGetters
  } = _getProxyHandler({
    isShallow,
    isReadonly,
    reactive: !isReadonly ? __getApi(true) : undefined,
    readonly: isReadonly ? __getApi(true) : undefined
  })

  Object.defineProperty(__getApi, 'trapGetters', {
    get() {
      return [...trapGetters]
    },
    enumerable: true
  })
  Object.defineProperty(__getApi, 'reactiveMap', {
    value: reactiveMap,
    enumerable: true
  })
  Object.defineProperty(__getApi, 'isExpectedReactive', {
    value: isExpectedReactive,
    enumerable: true
  })

  return __getApi
}

export { createReactive }
