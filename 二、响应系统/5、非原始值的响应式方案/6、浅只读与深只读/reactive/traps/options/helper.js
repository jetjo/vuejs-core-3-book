import {
  error,
  log,
  throwErr,
  warn
} from '../../../../../4、响应系统的作用与实现/index.js'
import {
  canReactive,
  canReadonly
} from '../../../../8、代理Set和Map/reactive/traps/helper.js'

const lastCallRecordInit = () => ({
  __proto__: null,
  reactive: {
    __proto__: null,
    type: 'reactive',
    options: undefined,
    result: undefined
  },
  readonly: {
    __proto__: null,
    type: 'readonly',
    options: undefined,
    result: undefined
  },
  shallowReactive: {
    __proto__: null,
    type: 'shallowReactive',
    options: undefined,
    result: undefined
  },
  shallowReadonly: {
    __proto__: null,
    type: 'shallowReadonly',
    options: undefined,
    result: undefined
  }
})

const lastCallRecord = new WeakMap()

function requireRegularOption(options) {
  // shallow-copy
  const _options = Object.assign(Object.create(null), options)
  const { isShallow, isReadonly, reactive, readonly, reactiveApi } = _options
  delete _options.reactive
  delete _options.readonly
  delete _options.reactiveApi
  for (const [key, value] of Object.entries(_options)) {
    if (value === undefined) {
      delete _options[key]
      warn(`缺少${key}选项!`)
    }
    if (typeof value !== 'number') continue
    if (isNaN(value)) throwErr(`必需的${key}选项不能为NaN!`)
  }
  if (isShallow) return _options
  if (typeof reactiveApi === 'function') {
    _options.reactiveApi = reactiveApi
    return _options
  }

  if (isReadonly) {
    if (typeof readonly !== 'function') throwErr('缺少必需的readonly API!')
    _options.reactiveApi = readonly
    _options.canReactive = canReadonly
    return _options
  }

  if (typeof reactive !== 'function') throwErr('缺少必需的reactive API!')

  _options.reactiveApi = reactive
  _options.canReactive = canReactive
  return _options
}

const _getRecord = ({ isShallow, isReadonly }, funcBeCalled) => {
  if (!lastCallRecord.has(funcBeCalled))
    lastCallRecord.set(funcBeCalled, lastCallRecordInit())
  const record = lastCallRecord.get(funcBeCalled)
  return isShallow
    ? isReadonly
      ? record.shallowReadonly
      : record.shallowReactive
    : isReadonly
      ? record.readonly
      : record.reactive
}

const _isSame = (record, options) => {
  if (record.options === undefined) return false
  const _options = requireRegularOption(options)
  for (const [key, value] of Object.entries(record.options)) {
    if (_options[key] !== value) return false
  }
  return true
}

function getLastCallRecord(options, funcBeCalled) {
  const record = _getRecord(options, funcBeCalled)

  const isSameCall = _isSame(record, options)

  return { lastCallRecord: record, isSameCall }
}

function saveRecord(requiredOptions, result, funcBeCalled) {
  const _options = requireRegularOption(requiredOptions)
  const record = _getRecord(_options, funcBeCalled)
  delete _options.isShallow
  delete _options.isReadonly
  if (record.options === undefined) {
    record.options = _options
    record.result = result
    log(record, funcBeCalled.name, 'init')
    return
  }
  for (const key of Object.keys(record.options)) {
    const newOV = _options[key]
    if (newOV === undefined) throwErr(`缺少必需的${key}选项!`)
    // 提防`oldOV !== newOV`但是都是`NaN`的情况
    if (typeof newOV === 'number' && isNaN(newOV))
      throwErr(`必需的${key}选项不能为NaN!`)
    record.options[key] = newOV
  }
  record.result = result
  log(record, funcBeCalled.name, 'update')
}

export { requireRegularOption, getLastCallRecord, saveRecord }
