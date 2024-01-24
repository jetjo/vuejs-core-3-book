import { withRecordTrapOption } from '../barrel-option.js'
import { ITERATE_KEY, PROTOTYPE, RAW, toRaw } from '../barrel-convention.js'
import { canReactive } from '../barrel-trap-helper.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{keys: SetMapPrototype['keys']}}
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
    Object.defineProperty(res, 'keys', {
      value() {
        /**@type {SetMapPrototype} */
        const target = this[RAW]
        const tartoRaw = toRaw(target)
        const iterator = target.keys() // proto.keys.call(tartoRaw)
        const KEY = ITERATE_KEY
        if (Effect.hasActive) track(tartoRaw, KEY)
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
    factoryName: 'getSetMapKeysProxy',
    option
  })
}
