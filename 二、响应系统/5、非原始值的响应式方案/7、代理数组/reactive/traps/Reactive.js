import getReactive from '../../../../reactive/_traps/Reactive/5-6.js'
import {
  TRY_PROXY_NO_RESULT,
  RAW,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG
} from './convention.js'
import getArrayInstrumentations from './array/index.js'
import { withRecordTrapOption } from '../../../../reactive/_traps/option.js'

/**@type {ReactiveCtorFactory} */
function factory({
  isShallow,
  isReadonly,
  arrayInstrumentations,
  ReactiveBase,
  Effect,
  track
}) {
  return class Reactive extends ReactiveBase {
    constructor(...args) {
      super(...args)
    }
    static handleArray(target, key, receiver) {
      // 为了避免意外及性能考虑,不宜对symbol类型的key继续追踪
      if (typeof key === 'symbol') return target[key]
      // // 使用for...of遍历可迭代对象如数组时,需要读取Symbol.iterator属性
      // if (key === Symbol.iterator) return target[key]
      // if (key === 'length' || isValidArrayIndex(key, false))
      // if (!isReadonly && Effect.hasActive) {
      // 移到findProxy中
      //   if (arrayInstrumentations.isFindMethod.call(receiver, key)) {
      //     track(target, ITERATE_ KEY_VAL)
      //   }
      // }
      // 到底target有自身的方法覆盖了原型方法时该如何?交由各自方法的代理去决定
      // if (Object.hasOwn(target, key)) return TRY_PROXY_NO_RESULT
      // if (Object.hasOwn(arrayInstrumentations, key)) {
      const res = Reflect.get(arrayInstrumentations, key, receiver)
      if (typeof res !== 'function') return TRY_PROXY_NO_RESULT
      return res
      // }
      return TRY_PROXY_NO_RESULT
    }

    static tryGetFlag(target, key, receiver) {
      if (key === RAW) return target
      if (key === REACTIVE_FLAG) return true
      if (key === SHALLOW_REACTIVE_FLAG) return isShallow
      if (key === READONLY_REACTIVE_FLAG) return isReadonly
      return TRY_PROXY_NO_RESULT
    }

    static tryGet(target, key, receiver) {
      const res = this.tryGetFlag(target, key, receiver)
      if (res !== TRY_PROXY_NO_RESULT) return res
      if (typeof key === 'symbol') return target[key]
      if (key === 'prototype' || key === 'constructor' || key === '__proto__') {
        // 调用数组的splice方法时会读取constructor属性,不知为何...
        return target[key]
      }
      if (Array.isArray(target)) {
        return this.handleArray(target, key, receiver)
      }
      return TRY_PROXY_NO_RESULT
    }
  }
}

/**@param {ProxyTrapOption} option  */
export default function (option) {
  const arrayInstrumentations = getArrayInstrumentations(option)
  const ReactiveBase = getReactive(option)
  const { isShallow, isReadonly, version } = option
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getReactive',
    arrayInstrumentations,
    ReactiveBase,
    option: isReadonly
      ? undefined
      : { __proto__: null, Effect: option.Effect, track: option.track }
  })
}
