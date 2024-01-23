import { withRecordTrapOption } from '#reactive/traps/option.js'
import { UndefinedTrapName } from './helper.js'

/**@type {TrapFactory<'has'>} */
function factory({ isReadonly, Effect, track, version }) {
  if (isReadonly) return UndefinedTrapName('has')
  return function has(target, p) {
    if (Effect.hasActive) track(target, p, has)
    return Reflect.has(target, p)
  }
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, Effect, track, version }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getHasTrap',
    option: isReadonly ? undefined : { __proto__: null, Effect, track }
  })
}
