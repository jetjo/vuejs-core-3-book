import { warn } from '../../../index.js'
import {
  RAW,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG,
  TRY_PROXY_NO_RESULT
} from './convention.js'
import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'

/**@type {ReactiveCtorFactory} */
function factory({ isShallow, isReadonly, version }) {
  return class Reactive {
    static tryGet(target, key, receiver) {
      if (key === RAW) return target
      if (key === REACTIVE_FLAG) return true
      if (key === SHALLOW_REACTIVE_FLAG) return isShallow
      if (key === READONLY_REACTIVE_FLAG) return isReadonly
      return TRY_PROXY_NO_RESULT
    }

    static trySet(target, key, newVal, receiver) {
      if (
        RAW === key ||
        REACTIVE_FLAG === key ||
        SHALLOW_REACTIVE_FLAG === key ||
        READONLY_REACTIVE_FLAG === key
      ) {
        // TypeError: Cannot convert a Symbol value to a string
        // warn('getReactive 5-6', `成员${key}是只读的!`)
        // warn('getReactive 5-6', `成员是只读的!`, key)
        // warn('getReactive 5-6', `成员${key.toString()}是只读的!`)
        warn(
          `getReactive ${version}`,
          `成员Symbol(${key.description})是只读的!`
        )
        // global-conf.js:11 TypeError: 'set' on proxy: trap returned falsish for property 'Symbol(raw)'
        // return false
        return true
      }
      // RangeError: Maximum call stack size exceeded
      // const suc = Reflect.set(reactive(target), key, newVal, receiver)
      return TRY_PROXY_NO_RESULT
    }
  }
  // #region 注释
  // static handleSetFail(target, key, newVal, receiver, suc = false) {
  //   const desc = Reflect.getOwnPropertyDescriptor(target, key)
  //   if (desc) {
  //     const { value, writable, get, set, configurable } = desc
  //     if (configurable || (value === newVal && typeof get === 'undefined')) {
  //       error(`target[${key}]赋值失败!`)
  //       return true
  //     }
  //     error(`target[${key}]赋值失败, 将抛出TypeError异常!`)
  //     return false
  //   }
  //   error(`target[${key}]赋值失败, 可能抛出TypeError异常!`)
  //   // 如果desc是undefined,并且suc是false的情况下,
  //   // 失败来自于target的原型的代理,该有target的原型的代理来处理
  //   return false
  // }
  // }
  // //NOTE:  TypeError: Cannot assign to read only property 'prototype' of function
  // // 类需要实例化,实例化需要调用Reactive.prototype.constructor???
  // // Reactive.prototype = null
  // Object.setPrototypeOf(Reactive, null)

  // // TypeError: Class constructor Reactive cannot be invoked without 'new'
  // Object.freeze(Reactive)
  // return Reactive
  // #endregion
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, version }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getReactive'
  })
}
