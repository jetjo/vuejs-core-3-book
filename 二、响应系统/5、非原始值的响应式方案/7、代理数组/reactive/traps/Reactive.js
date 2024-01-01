import { getReactive as _getReactive } from '../../../6、浅只读与深只读/reactive/traps/Reactive.js'
import {
  TRY_PROXY_NO_RESULT,
  RAW,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG
} from './convention.js'
import { getArrayInstrumentations } from './array/index.js'
import {
  isValidArrayIndex,
  warn,
  log
} from '../../../../4、响应系统的作用与实现/index.js'
import {
  getLastCallRecord,
  requireRegularOption,
  saveRecord
} from '../../../6、浅只读与深只读/reactive/traps/options/helper.js'

function getReactive(options = {}) {
  const arrayInstrumentations = getArrayInstrumentations(options)
  const _Reactive = _getReactive(options)

  const _options = {
    __proto__: null,
    ...options,
    arrayInstrumentations,
    _Reactive
  }

  // prettier-ignore
  const { lastCallRecord, isSameCall } = getLastCallRecord(_options, getReactive)
  // log(lastCallRecord.type, isSameCall, 'getReactive, 7')

  if (isSameCall) return lastCallRecord.result

  const { isShallow, isReadonly, reactiveApi } = requireRegularOption(_options)
  const requiredOptions = {
    __proto__: null,
    isShallow,
    isReadonly,
    arrayInstrumentations,
    reactiveApi,
    _Reactive
  }

  // const _tryGet = _Reactive.tryGet
  // _tryGet.bind(Reactive) // 不能使用bind,否则会导致this丢失???

  class Reactive extends _Reactive {
    constructor(...args) {
      super(...args)
    }
    static handleArray(target, key, receiver) {
      // prettier-ignore
      if (key === 'length' || isValidArrayIndex(key, false)) return TRY_PROXY_NO_RESULT
      if (Object.hasOwn(target, key)) {
        warn(`数组实例自定义的属性${key}, 无法保证响应性!`)
        return TRY_PROXY_NO_RESULT
      }
      if (Object.hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver)
      }
      return TRY_PROXY_NO_RESULT
    }

    static tryGet(target, key, receiver) {
      // const _res = Reactive._tryGet(target, key, receiver)
      // if (_res !== TRY_PROXY_NO_RESULT) return _res
      if (key === RAW) return target
      if (key === REACTIVE_FLAG) return true
      if (key === SHALLOW_REACTIVE_FLAG) return isShallow
      if (key === READONLY_REACTIVE_FLAG) return isReadonly
      // 为了避免意外及性能考虑,不宜对symbol类型的key继续追踪
      if (typeof key === 'symbol') return target[key]
      // 使用for...of遍历可迭代对象如数组时,需要读取Symbol.iterator属性
      if (key === Symbol.iterator) return target[key]
      if (Array.isArray(target)) {
        if (key === 'length' || isValidArrayIndex(key, false))
          return TRY_PROXY_NO_RESULT
        return this.handleArray(target, key, receiver)
      }
      return TRY_PROXY_NO_RESULT
    }
  }
  saveRecord(requiredOptions, Reactive, getReactive)
  return Reactive
}

export { getReactive }
