import { withRecordTrapOption } from '#reactive/traps/option.js'
import { isValidArrayIndex } from '#utils'
import { TRY_PROXY_NO_RESULT, toRaw } from './convention.js'
import { canReactive, canReadonly } from './helper.js'

/**@type {TrapFactory<'get'>} */
function factory({
  isShallow,
  isReadonly,
  reactive,
  Effect,
  track,
  Reactive,
  readonly,
  version
}) {
  if (isReadonly) {
    return function get(target, key, receiver) {
      // prettier-ignore
      if (typeof key === 'symbol' || key !== 'length' && !isValidArrayIndex(key, false)) {
        const tryRes = Reactive.tryGet(target, key, receiver)
        if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
      }
      let res = Reflect.get(target, key, receiver)
      if (!isShallow && canReadonly(res)) return readonly(res)
      return res
    }
  }
  return function get(target, key, receiver) {
    // prettier-ignore
    if (
      typeof key === 'symbol' ||
      (key !== 'length' && !isValidArrayIndex(key, false))
      ) {
        const tryRes = Reactive.tryGet(target, key, receiver)
        if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
      }
    // console.warn('key: ', key, target)
    const res = Reflect.get(target, key, receiver)
    if (Effect.hasActive) {
      track(target, key, get)
    }
    if (!isShallow && canReactive(res)) return reactive(res)
    return res
  }
}

/**@param {ProxyTrapOption}  */
export default function ({
  isShallow,
  isReadonly,
  readonly,
  reactive,
  Reactive,
  Effect,
  track,
  version
}) {
  const option = isShallow
    ? isReadonly
      ? { __proto__: null, Reactive }
      : { __proto__: null, Reactive, Effect, track }
    : isReadonly
      ? { __proto__: null, Reactive, readonly }
      : { __proto__: null, Reactive, Effect, track, reactive }
  return withRecordTrapOption({
    factory,
    option,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getGetTrap'
  })
}
