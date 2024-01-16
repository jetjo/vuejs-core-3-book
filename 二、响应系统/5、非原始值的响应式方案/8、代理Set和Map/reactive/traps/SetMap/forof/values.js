import { withRecordTrapOption } from '../../../../../../reactive/_traps/option.js'
import { throwErr } from '../../../../../../utils/index.js'
import {
  ITERATE_KEY,
  ITERATE_KEY_VAL,
  PROTOTYPE,
  RAW,
  getRaw
} from '../../convention.js'
import { canReactive } from '../../helper.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{values: SetMapPrototype['values']}}
 */
function factory({
  isShallow,
  isReadonly,
  reactiveInfo,
  Effect,
  track,
  reactive
}) {
  const res = Object.create(null)
  if (!isReadonly && !isShallow) {
    Object.defineProperty(res, 'values', {
      value() {
        /**@type {SetMapPrototype} */
        const target = this[RAW]
        const targetRaw = getRaw(target)
        const proto = reactiveInfo.get(target)[PROTOTYPE]
        if (proto == null) throwErr('获取原型失败!')
        const iterator = target.values() // proto.values.call(targetRaw)
        const KEY =
          proto === Map.prototype || proto instanceof Map
            ? ITERATE_KEY_VAL
            : ITERATE_KEY
        if (Effect.hasActive) track(targetRaw, KEY)
        const wrap = o => (canReactive(o) ? reactive(o) : o)
        return {
          __proto__: null,
          [Symbol.iterator]() {
            return this
          },
          next() {
            const { value, done } = iterator.next()
            return { value: wrap(value), done }
          }
        }
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
  reactiveInfo,
  Effect,
  track,
  reactive
}) {
  let option
  if (!isReadonly && !isShallow) {
    option = { __proto__: null, reactiveInfo, Effect, track, reactive }
  }
  return withRecordTrapOption({
    factory,
    version,
    isShallow,
    isReadonly,
    isSetOrMap: true,
    factoryName: 'getSetMapValuesProxy',
    option
  })
}
