/* 使用Proxy和Reflect创建响应式数据 */
/* 支持分支切换与cleanup */
/* 支持effect嵌套 */
/* 避免active Effect的无限递归调用 */
/* 支持响应调度 */
/* 支持创建深度响应式数据 */

import { activeEffect } from '../8-计算属性与lazy/1-effect-fn-reg.js'
import { ITERATE_KEY, track, trriger } from './2-reactive.js'

export { bucket } from './2-reactive.js'

// const bucket = new WeakMap()
const reactiveMap = new WeakMap()

/**
 * @deprecated
 * @description 判断是不是reactive api的返回类型 */
function isReactiveOld(target) {
  typeof target // 'object'
  // Uncaught TypeError: Function has non-object prototype 'undefined' in instanceof check
  // because Proxy.prototype is undefined
  // target instanceof Proxy
  target.__proto__ // Object.prototype

  return target.__is_reactive
}

function isReactive(obj) {
  // 也不对,可能还没收集
  // const depsMap = bucket.get(obj)
  // return !!depsMap
  return isReactiveOld(obj)
}

function reactive(target) {
  if (typeof target !== 'object' || null == target)
    throw new Error('WeakMap的key必须是object!')
  if (isReactive(target)) {
    console.warn('target已经是reactive')
    return target
  }
  let py = reactiveMap.get(target)
  if (!py) {
    reactiveMap.set(target, (py = createReactive(target)))
  }
  return py
}

function createReactive(target, isShallow = false) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 在有些逻辑下,
      // 对target的操作不需要proxy拦截定制时,
      // 就需要返回target自身
      if (key === 'raw') return target
      // 内部约定用于判断是否是reactive返回值类型的标识
      if (key === '__is_reactive') return true
      // if(key === '__proto__') return target.__proto__;

      /* NOTE: 不收集raw、__is_reactive,
      收集__proto__??? */
      activeEffect && track(target, key)
      const res = Reflect.get(target, key, receiver)
      if (key === '__proto__') {
        const isEqu = Object.is(res, target.__proto__)
        // if (Object.is(Object, res)) return res
        // if (Object === target.__proto__) return res
        // if (Object === res) return res
        if (isEqu && {}.__proto__ === res) return target.__proto__
      }
      if (!isShallow && typeof res === 'object' && null !== res) {
        return reactive(res)
      }
      return res
    },
    set(target, key, newVal, receiver) {
      if (key === 'raw') return false
      if (key === '__is_reactive') return false
      const suc = Reflect.set(target, key, newVal, receiver)
      trriger(target, key)
      return suc
    },
    ownKeys(target) {
      if (activeEffect && activeEffect.options.needTrapIterabe) {
        track(target, ITERATE_KEY)
      }
      return Reflect.ownKeys(target)
    }
  })
}

export { reactive, reactiveMap, isReactive }
