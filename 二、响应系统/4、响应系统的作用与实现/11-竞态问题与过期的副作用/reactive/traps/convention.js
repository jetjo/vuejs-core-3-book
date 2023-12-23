import { throwErr } from '../../utils/index.js'

const RAW = Symbol('raw')

function getTarget(reactive, internalCall = false) {
  if (!internalCall && !isReactive(reactive))
    throwErr('参数必须是reactive返回值类型, 继续执行可能出错!')
  return reactive[RAW]
}

const TRIGGER_TYPE = {
  ADD: Symbol('TRIGGER_TYPE.ADD'),
  SET: Symbol('TRIGGER_TYPE.SET'),
  DELETE: Symbol('TRIGGER_TYPE.DELETE'),
  CLEAR: Symbol('TRIGGER_TYPE.CLEAR'),
  EmptySlotSet: Symbol('TRIGGER_TYPE.EmptySlotSet'),
  LengthSubtract: Symbol('TRIGGER_TYPE.LengthSubtract')
}

/**@typedef {typeof TRIGGER_TYPE} TriggerType */

const REACTIVE_FLAG = Symbol('__is_reactive_return_type')
const SHALLOW_REACTIVE_FLAG = Symbol('__is_shallow_reactive_return_type')

const isReactive = obj =>
  obj &&
  (typeof obj === 'object' || typeof obj === 'function') &&
  true === obj[REACTIVE_FLAG]

const isShallowReactive = (obj, internalCall = false) =>
  (internalCall || isReactive(obj)) && true === obj[SHALLOW_REACTIVE_FLAG]

const ITERATE_KEY = Symbol('ITERATE_KEY')

const TRY_PROXY_NO_RESULT = Symbol('TRY_PROXY_NO_RESULT')

export {
  RAW,
  getTarget,
  TRIGGER_TYPE,
  REACTIVE_FLAG,
  SHALLOW_REACTIVE_FLAG,
  isReactive,
  isShallowReactive,
  ITERATE_KEY,
  TRY_PROXY_NO_RESULT
}
