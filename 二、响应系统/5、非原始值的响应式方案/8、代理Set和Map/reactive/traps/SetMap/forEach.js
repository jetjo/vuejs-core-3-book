import { withRecordTrapOption } from './barrel-option.js'
import { throwErr } from './barrel-utils.js'
import {
  ITERATE_KEY,
  ITERATE_KEY_VAL,
  PROTOTYPE,
  RAW,
  getRaw
} from '../convention.js'
import { canReactive } from '../helper.js'

/**
 *
 * @param {ProxyTrapOption}
 * @returns {{forEach: SetMapPrototype['forEach']}}}
 */
function factory({
  isShallow,
  isReadonly,
  Effect,
  track,
  reactive,
  reactiveInfo
}) {
  const res = Object.create(null)
  if (!isReadonly && !isShallow) {
    const wrap = o => (canReactive(o) ? reactive(o) : o)
    Object.defineProperty(res, 'forEach', {
      __proto__: null,
      value(callback, thisArg) {
        /**@type {SetMapPrototype} */
        const target = this[RAW]
        const targetRaw = getRaw(target)
        const proto = reactiveInfo.get(target)[PROTOTYPE]
        if (proto == null) throwErr('获取原型失败!')
        // Map的forEach不仅能遍历到集合的键,还能直接遍历到集合的值,即依赖于值的变化,不止是增删
        const KEY = proto === Map.prototype ? ITERATE_KEY_VAL : ITERATE_KEY
        if (Effect.hasActive) track(targetRaw, KEY)
        target.forEach((value, key, target) => {
          callback.call(thisArg, wrap(value), wrap(key), this)
        })
      },
      enumerable: true
    })
    return res
  }
}

/**@param {ProxyTrapOption} */
export default function ({
  isShallow,
  isReadonly,
  version,
  Effect,
  track,
  reactive,
  reactiveInfo
}) {
  let option
  if (!isReadonly && !isShallow) {
    option = { __proto__: null, Effect, track, reactive, reactiveInfo }
  }
  return withRecordTrapOption({
    factory,
    version,
    isShallow,
    isReadonly,
    isSetOrMap: true,
    factoryName: 'getForEachProxy',
    option
  })
}
