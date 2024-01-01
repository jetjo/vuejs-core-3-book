import { error, warn, log } from '../../../index.js'
import {
  RAW,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG,
  TRY_PROXY_NO_RESULT
} from './convention.js'

import {
  getLastCallRecord,
  requireRegularOption,
  saveRecord
} from './options/helper.js'

/**
 * getReactive
 * @param {import('../index.js').ProxyTrapOption} [options={}]
 * */
function getReactive(options = {}) {
  const { lastCallRecord, isSameCall } = getLastCallRecord(options, getReactive)

  // log(lastCallRecord.type, isSameCall, 'getReactive, 6')

  if (isSameCall) return lastCallRecord.result
  // prettier-ignore
  const { isShallow, isReadonly, reactiveApi, canReactive } = requireRegularOption(options)
  const requiredOptions = {
    __proto__: null,
    isShallow,
    isReadonly,
    reactiveApi
  }

  class Reactive {
    /* readonly */
    static get [SHALLOW_REACTIVE_FLAG]() {
      return isShallow
    }
    static get [READONLY_REACTIVE_FLAG]() {
      return isReadonly
    }

    static tryGetProto(target) {
      const proto = Reflect.getPrototypeOf(target)
      const isExt = Reflect.isExtensible(target)
      if (!isExt) return proto
      if (!isShallow && proto !== null && canReactive(proto))
        return reactiveApi(proto)
      // return null
      return proto
    }

    static needProto(target, key) {
      if ('__proto__' === key) error('target.__proto__已经弃用!')
      // 不妥, 考虑ownKeys
      // const desc = Reflect.getOwnPropertyDescriptor(target, key)
      // if (!desc && handleProto) {
      //   return this.tryGetProto(target)
      // }
    }

    static tryGet(target, key, receiver) {
      if (key === RAW) return target
      if (key === REACTIVE_FLAG) return true
      if (key === SHALLOW_REACTIVE_FLAG) return isShallow
      if (key === READONLY_REACTIVE_FLAG) return isReadonly
      const proto = this.needProto(target, key)
      if (proto) return Reflect.get(proto, key, receiver)
      return TRY_PROXY_NO_RESULT
    }

    static trySet(target, key, newVal, receiver) {
      if (
        RAW === key ||
        REACTIVE_FLAG === key ||
        SHALLOW_REACTIVE_FLAG === key ||
        READONLY_REACTIVE_FLAG === key
      ) {
        warn(`成员${key}是只读的!`)
        return false
      }
      const proto = this.needProto(target, key)
      // RangeError: Maximum call stack size exceeded
      // const suc = Reflect.set(reactive(target), key, newVal, receiver)
      if (proto) return Reflect.set(proto, key, newVal, receiver)
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

  //NOTE:  TypeError: Cannot assign to read only property 'prototype' of function
  // 类需要实例化,实例化需要调用Reactive.prototype.constructor???
  // Reactive.prototype = null
  Object.setPrototypeOf(Reactive, null)

  // TypeError: Class constructor Reactive cannot be invoked without 'new'
  // console.log(Reactive())
  Object.freeze(Reactive)
  saveRecord(requiredOptions, Reactive, getReactive)
  return Reactive
}

/**@typedef {ReturnType<getReactive>} ReactiveCtor */

export { getReactive }
