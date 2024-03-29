import { withRecordTrapOption } from './barrel-option.js'
import { ITERATE_KEY, RAW, toRaw } from '../convention.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{size: SetMapWsWmPrototype['size']}}
 */
function factory({ track, Effect, isReadonly }) {
  const res = Object.create(null)
  Object.defineProperty(res, 'size', {
    __proto__: null,
    get() {
      const target = this[RAW]
      const tartoRaw = toRaw(this)
      const res = Reflect.get(target, 'size', target)
      if (!isReadonly && Effect.hasActive) track(tartoRaw, ITERATE_KEY)
      if (typeof res === 'function') return res.bind(tartoRaw)
      return res
    },
    enumerable: true
  })
  return res
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, track, version, Effect }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    isSetOrMap: true,
    factoryName: 'getCommonSizeProxy',
    option: isReadonly ? undefined : { __proto__: null, track, Effect }
  })
}
