import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'
import { log } from '../../../../4、响应系统的作用与实现/index.js'
import { ITERATE_KEY } from './convention.js'

/**@type {TrapFactory<'ownKeys'>} */
function factory(isShallow, isReadonly, { Effect, track }) {
  // log('getOwnKeysTrap 5-6', isShallow, isReadonly, 'factory')
  return function ownKeys(target) {
    // log('getOwnKeysTrap 5-6', target)
    if (!isReadonly && Effect.hasActive) track(target, ITERATE_KEY, ownKeys)
    return Reflect.ownKeys(target)
  }
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, Effect, track }) {
  // log('getOwnKeysTrap 5-6', isShallow, isReadonly)
  const options = isReadonly
    ? { __proto__: null }
    : { __proto__: null, Effect, track }
  return withRecordTrapOption({
    factory,
    options,
    isShallow,
    isReadonly
  })
}
