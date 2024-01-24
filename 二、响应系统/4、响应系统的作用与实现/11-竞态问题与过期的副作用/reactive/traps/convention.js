import { throwErr } from '../../utils/index.js'

const RAW = Symbol('raw')

function getTarget(reactive, hasReactiveFlag = false) {
  if (!hasReactiveFlag && !isReactive(reactive))
    throwErr('参数必须是reactive返回值类型, 继续执行可能出错!')
  return reactive[RAW]
}

function toRaw(reactive, hasReactiveFlag = false) {
  hasReactiveFlag = hasReactiveFlag || isReactive(reactive)
  if (!hasReactiveFlag) return reactive
  if (!isReadonlyReactive(reactive, true)) return reactive[RAW]
  const target = reactive[RAW]
  if (!isReactive(target)) return target
  return target[RAW]
}

/**@typedef {typeof getTarget} GetTarget*/

/**@type {TRIGGER_TYPE_TD} */
const TRIGGER_TYPE = Object.freeze({
  __proto__: null,
  ADD: 'TRIGGER_TYPE.ADD',
  SET: 'TRIGGER_TYPE.SET',
  DELETE: 'TRIGGER_TYPE.DELETE',
  CLEAR: 'TRIGGER_TYPE.CLEAR',
  EmptySlotSet: 'TRIGGER_TYPE.EmptySlotSet',
  LengthSubtract: 'TRIGGER_TYPE.LengthSubtract'
})

/**@typedef {typeof TRIGGER_TYPE} TriggerType */

const REACTIVE_FLAG = Symbol('__is_reactive_return_type')
const SHALLOW_REACTIVE_FLAG = Symbol('__is_shallow_reactive_return_type')
const READONLY_REACTIVE_FLAG = Symbol('readonly_flag')
const VERSION_FLAG = Symbol('version_flag')

const isReactive = obj =>
  obj &&
  typeof obj === 'object' &&
  // (typeof obj === 'object' || typeof obj === 'function') &&
  true === obj[REACTIVE_FLAG]

const isShallowReactive = (obj, hasReactiveFlag = false) =>
  (hasReactiveFlag || isReactive(obj)) && true === obj[SHALLOW_REACTIVE_FLAG]

function isReadonlyReactive(target, hasReactiveFlag = false) {
  return (
    (hasReactiveFlag || isReactive(target)) &&
    target[READONLY_REACTIVE_FLAG] === true
  )
}

const ITERATE_KEY = Symbol('ITERATE_KEY')
const ITERATE_KEY_VAL = Symbol('ITERATE_KEY_VAL')

const TRY_PROXY_NO_RESULT = 'TRY_PROXY_NO_RESULT' // Symbol('TRY_PROXY_NO_RESULT')

export {
  RAW,
  getTarget,
  TRIGGER_TYPE,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG,
  VERSION_FLAG,
  isReactive,
  isShallowReactive,
  isReadonlyReactive,
  ITERATE_KEY,
  TRY_PROXY_NO_RESULT,
  ITERATE_KEY_VAL,
  toRaw
}
