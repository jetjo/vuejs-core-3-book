import { error, warn } from '../../utils/index.js'
import {
  RAW,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  TRY_PROXY_NO_RESULT
} from './convention.js'

/**getReactive */
function getReactive(options = {}) {
  const { isShallow } = options
  return class Reactive {
    static tryGet(target, key, receiver) {
      if (key === RAW) return target
      if (key === REACTIVE_FLAG) return true
      if (key === SHALLOW_REACTIVE_FLAG) return isShallow
      return TRY_PROXY_NO_RESULT
    }

    static trySet(target, key, newVal, receiver) {
      if (
        RAW === key ||
        REACTIVE_FLAG === key ||
        SHALLOW_REACTIVE_FLAG === key
      ) {
        warn(`成员${key}是只读的!`)
        return true
      }
      return TRY_PROXY_NO_RESULT
    }

    static handleSetFail(target, key, newVal, receiver, suc = false) {
      const desc = Reflect.getOwnPropertyDescriptor(target, key)
      if (desc) {
        const { value, writable, get, set, configurable } = desc
        if (configurable || (value === newVal && typeof get === 'undefined')) {
          error(`target[${key}]赋值失败!`)
          return true
        }
        error(`target[${key}]赋值失败, 将抛出TypeError异常!`)
        return false
      }
      error(`target[${key}]赋值失败, 可能抛出TypeError异常!`)
      // 如果desc是undefined,并且suc是false的情况下,
      // 失败来自于target的原型的代理,该有target的原型的代理来处理
      return false
    }
  }

  // //NOTE:  TypeError: Cannot assign to read only property 'prototype' of function
  // // 类需要实例化,实例化需要调用Reactive.prototype.constructor???
  // // Reactive.prototype = null
  // Object.setPrototypeOf(Reactive, null)

  // // console.log(Reactive)
  // // TypeError: Class constructor Reactive cannot be invoked without 'new'
  // // console.log(Reactive())
  // // console.log(new Reactive()) //OK

  // // return Object.freeze(Reactive)
  // return Reactive
}

/**@typedef {ReturnType<getReactive>} ReactiveCtor */

export { getReactive }
