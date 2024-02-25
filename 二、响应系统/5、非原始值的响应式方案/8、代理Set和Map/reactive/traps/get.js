import { withRecordTrapOption } from '#reactive/traps/option.js'
import { TRY_PROXY_NO_RESULT, toRaw } from './convention.js'
import { canReactive, canReadonly } from './helper.js'

/**@type {TrapFactory<'get'>} */
function factory({
  isShallow,
  isReadonly,
  isSetOrMap,
  Reactive,
  Effect,
  track,
  reactive,
  readonly,
  get: oldGet
}) {
  if (!isSetOrMap) return oldGet
  const returnVal = res => {
    if (isShallow) return res

    if (isReadonly) {
      if (canReadonly(res)) return readonly(res)
      return res
    }

    if (canReactive(res)) return reactive(res)
    return res
  }
  return function get(target, key, receiver) {
    // const _ = function get(isSetOrMap, target, key, receiver) {
    const tryRes = Reactive.tryGet(target, key, receiver, true)
    if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly && Effect.hasActive) {
      track(target, key)
    }
    // 定义的拦截器函数中,目前没有对Call和Constructor的拦截,所以不用代理function
    // 但是function也是一种对象,也可以有自定义属性,该如何处理??? vue如何处理的???
    return returnVal(res)
  }
  // const get = _.bind(null, false)
  // get.trapForSetAndMap = _.bind(null, true)
  // return get
}

/**@param {ProxyTrapOption}  */
export default function ({
  isShallow,
  isReadonly,
  readonly,
  isSetOrMap,
  get,
  reactive,
  Reactive,
  Effect,
  track,
  version
}) {
  const option = isShallow
    ? isReadonly
      ? { __proto__: null, get, Reactive }
      : { __proto__: null, get, Reactive, Effect, track }
    : isReadonly
      ? { __proto__: null, get, Reactive, readonly }
      : { __proto__: null, get, Reactive, Effect, track, reactive }
  return withRecordTrapOption({
    factory,
    option,
    isShallow,
    isReadonly,
    isSetOrMap,
    version,
    factoryName: 'getGetTrap'
  })
}
