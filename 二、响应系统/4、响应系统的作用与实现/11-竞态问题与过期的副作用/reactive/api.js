/* @4-4 [分支切换与cleanup] */
/* @4-6 [无限递归循环] */
/* @4-7 [调度执行] */
/* @4-7-1 [副作用列队与中间态] */
/* @4-9 [深度响应] */
/* @4-9-1 [对象成员遍历、添加、删除时依赖收集与effect触发] */
import { warn } from '../utils/index.js'
import { Effect } from '../effect/index.js'
import * as trapsModule from './traps/index.js'
import { isReactive } from './traps/convention.js'
import {
  requireReactiveTarget,
  getProxyHandler,
  doWithAllTrapGetter
} from './traps/helper.js'
import { trigger, track } from './track-trigger.js'
import { getReactive } from './traps/Reactive.js'

let handleThrow = false
let handleProto = false

/**@typedef {import('./index.js').ProxyTrapGetter} ProxyTrapGetter*/
/**@typedef {import('./index.js').ProxyTrapOption} ProxyTrapOption*/

/**@type {ProxyTrapOption} */
const _trapOption = {
  __proto__: null,
  Effect,
  // track: function () {
  //   // NOTE: 如果不使用runWithoutProto包裹track函数,
  //   // 在调试时,假如在track内部设置断点,
  //   // 当在浏览器开发者工具中在track内部中断后,
  //   // 把鼠标移到track的第一个参数target上,
  //   // 浏览器的开发者工具会展开target内容及其原型链上的内容,
  //   // 假如target的原型链上有被代理的原型(即reactive)
  //   // 这会导致target的原型的代理的ownKeys trap被执行,
  //   // 从而将当前被中断的effect作为对target原型的遍历操作(ITERATE_KEY)的被依赖者
  //   // 被收集到bucket中,给调试带来困惑😖
  //   runWithoutProto(arguments[0], () => track(...arguments))
  // },
  track,
  trigger,
  handleThrow,
  handleProto
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
    ...trapOption,
    ..._trapOption
  }
  const traps = []
  doWithAllTrapGetter(trapsModule, getter => traps.push(getter(trapOption)))
  _trapGetters.forEach(getter => traps.push(getter(trapOption)))
  return { proxyHandler: getProxyHandler(traps), trapOption }
}

function _getApi(isShallow = false) {
  // provideMethodToModule(reactive, reactiveReceivor)
  const reactive = __getApi(true)
  const Reactive = getReactive({ reactive, isShallow, handleProto })
  const trapOptions = {
    __proto__: null,
    reactive,
    Reactive,
    isShallow
  }

  const { proxyHandler: handler, trapOption: trapOpt } =
    _getProxyHandler(trapOptions)

  /**@param {ProxyTrapGetter} trapGetter */
  __getApi.addTrapBeforeCall = function (trapGetter) {
    const trap = trapGetter({ ...trapOpt })
    const _handler = getProxyHandler([trap])
    for (const key in _handler) {
      if (Object.hasOwnProperty.call(_handler, key)) {
        handler[key] = _handler[key]
      }
    }
  }
  // __getApi.getProxyHandler = function () {
  //   return { ...handler }
  // }

  /* NOTE: 
  `shallowReactive`和`reactive`两个api用的不是同一个集合,
  但是内部和外部api是同一个集合,
  所以需要在`_getApi`内且`__getApi`外声明  */
  const reactiveMap = new WeakMap()

  function __getApi(internalCall = false) {
    return function reactive(target) {
      if (!internalCall) {
        requireReactiveTarget(target)
        if (isReactive(target)) {
          warn('参数target不能是reactive的返回值类型!')
          return target
        }
      }
      if (reactiveMap.has(target)) return reactiveMap.get(target)
      const py = new Proxy(target, handler)
      reactiveMap.set(target, py)
      return py
    }
  }

  return __getApi
}

export { _getApi as getApi, track, trigger }
