import { log } from '../../../../4、响应系统的作用与实现'
import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option'

/**@type {TrapFactory<'has'>} */
function factory(isShallow, isReadonly, { Effect, track }) {
  // log('getHasTrap 5-6', isShallow, isReadonly, 'factory')
  return function has(target, p) {
    if (!isReadonly && Effect.hasActive) track(target, p, has)
    return Reflect.has(target, p)
  }
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, Effect, track }) {
  // log('getHasTrap 5-6', isShallow, isReadonly)
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
