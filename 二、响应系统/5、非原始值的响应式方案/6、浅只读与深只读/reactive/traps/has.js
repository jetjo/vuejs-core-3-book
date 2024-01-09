import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option'

/**@type {TrapFactory<'has'>} */
function factory({ isReadonly, Effect, track, version }) {
  return function has(target, p) {
    if (!isReadonly && Effect.hasActive) track(target, p, has)
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
