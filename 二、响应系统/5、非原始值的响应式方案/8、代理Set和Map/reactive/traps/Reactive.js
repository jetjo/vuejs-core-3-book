// export * from '../../../7、代理数组/reactive/traps/Reactive.js'

import { PROTOTYPE_OF_BuildIn_SET__MAP } from './convention.js'

import { getReactive as _getReactive } from '../../../7、代理数组/reactive/traps/Reactive.js'
import { TRY_PROXY_NO_RESULT, getTarget } from './convention.js'
import { throwErr, warn } from '../../../../4、响应系统的作用与实现/index.js'

const lastCallRecord = {
  __proto__: null,
  reactive: Object.create(null),
  readonly: Object.create(null),
  shallowReactive: Object.create(null),
  shallowReadonly: Object.create(null)
  // track,
  // trigger,
  // reactiveInfo,
  // Reactive
}

function getReactive(options = {}) {
  // debugger

  options.getTarget = getTarget

  const Reactive = _getReactive(options)

  const { isShallow, isReadonly } = options
  const _lastCallRecord = isShallow
    ? isReadonly
      ? lastCallRecord.shallowReadonly
      : lastCallRecord.shallowReactive
    : isReadonly
      ? lastCallRecord.readonly
      : lastCallRecord.reactive

  const { track, trigger, reactiveInfo } = options

  if (
    _lastCallRecord.Reactive === Reactive &&
    _lastCallRecord.track === track &&
    _lastCallRecord.trigger === trigger &&
    _lastCallRecord.reactiveInfo === reactiveInfo
  )
    return Reactive

  Object.assign(_lastCallRecord, { Reactive, track, trigger, reactiveInfo })

  Reactive.tryGetForSetOrMap = function (target, key, receiver, preRes) {
    // TODO: add delete has
    throwErr('此功能正在路上...')
    return TRY_PROXY_NO_RESULT
  }

  return Reactive
}

export { getReactive }
