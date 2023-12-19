import { error, warn } from '../../../index.js'
import { TRY_PROXY_NO_RESULT } from './convention.js'
import { canReactive } from './helper.js'

// function reactive() {
//   // return reactive[INTERNAL_IMPL_KEY](...arguments)
// }
/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['get']}
 */
function getGetTrap(options = {}) {
  // warn('get get trap...')
  const { reactive, isShallow, Effect, track, Reactive, isReadonly, readonly } =
    options
  if (isReadonly) {
    return function get(target, key, receiver) {
      const tryRes = Reactive.tryGet(target, key, receiver)
      if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
      warn('get trap...')
      const res = Reflect.get(...arguments)
      if (!isShallow && canReactive(res)) return readonly(res)
      return res
    }
  }
  return function get(target, key, receiver) {
    const tryRes = Reactive.tryGet(target, key, receiver)
    if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
    warn('get trap...')
    if (Effect.hasActive) track(target, key, get)
    const res = Reflect.get(...arguments)
    if (!isShallow && canReactive(res)) return reactive(res)
    return res
  }
}

// export { reactive as reactiveReceivor, getGetTrap }
export { getGetTrap }
