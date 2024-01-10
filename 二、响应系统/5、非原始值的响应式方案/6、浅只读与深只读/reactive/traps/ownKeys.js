import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'
import { ITERATE_KEY } from './convention.js'

/**@type {TrapFactory<'ownKeys'>} */
function factory({ isReadonly, Effect, track, version }) {
  return function ownKeys(target) {
    if (!isReadonly && Effect.hasActive) track(target, ITERATE_KEY, ownKeys)
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
