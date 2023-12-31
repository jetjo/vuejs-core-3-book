import { getReactive as _getReactive } from '../../../6、浅只读与深只读/reactive/traps/Reactive.js'
import {
  TRY_PROXY_NO_RESULT,
  getTarget,
  RAW,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG
} from './convention.js'
import { getArrayInstrumentations } from './array/index.js'
import {
  isValidArrayIndex,
  warn
} from '../../../../4、响应系统的作用与实现/index.js'

const lastCallRecord = {
  __proto__: null,
  reactive: Object.create(null),
  readonly: Object.create(null),
  shallowReactive: Object.create(null),
  shallowReadonly: Object.create(null)
}

function getReactive(options = {}) {
  options.getTarget = getTarget
  const arrayInstrumentations = getArrayInstrumentations(options)
  const Reactive = _getReactive(options)

  const { isShallow, isReadonly } = options
  const _lastCallRecord = isShallow
    ? isReadonly
      ? lastCallRecord.shallowReadonly
      : lastCallRecord.shallowReactive
    : isReadonly
      ? lastCallRecord.readonly
      : lastCallRecord.reactive

  if (_lastCallRecord.Reactive === Reactive) return Reactive
  _lastCallRecord.Reactive = Reactive

  // const _tryGet = Reactive.tryGet
  // _tryGet.bind(Reactive) // 不能使用bind,否则会导致this丢失???
  // Reactive._tryGet = _tryGet

  function handleArray(target, key, receiver) {
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

  Reactive.tryGet = function (target, key, receiver) {
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
      return handleArray(target, key, receiver)
    }
    return TRY_PROXY_NO_RESULT
  }

  return Reactive
}

export { getReactive }
