import { withRecordTrapOption } from '#reactive/traps/option.js'
import { ITERATE_KEY } from './convention.js'
import { UndefinedTrapName } from './helper.js'

/**@type {TrapFactory<'ownKeys'>} */
function factory({ isReadonly, Effect, track, version }) {
  // vue也是如此, readonly时不需要追踪,则其行为与原生一致,不需要代理
  if (isReadonly) return UndefinedTrapName('ownKeys')
  return function ownKeys(target) {
    if (Effect.hasActive) track(target, ITERATE_KEY, ownKeys)
    return Reflect.ownKeys(target)
  }
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, Effect, track, version }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getOwnKeysTrap',
    option: isReadonly ? undefined : { __proto__: null, Effect, track }
  })
}
