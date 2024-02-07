import { warn } from '../../utils/index.js'
import { TRY_PROXY_NO_RESULT } from './convention.js'
import { canReactive } from './helper.js'

// function reactive() {
//   // return reactive[INTERNAL_IMPL_KEY](...arguments)
// }
/**
 * @param {Object} options
 * @param {EffectM} options.Effect
 * @param {ReactiveCtor} options.Reactive
 * @param {Track} options.track
 * @returns {ProxyHandler['get']}
 */
function getGetTrap(options = {}) {
  warn('get get trap...')
  const { reactive, isShallow, Effect, track, Reactive } = options
  return function get(target, key, receiver) {
    warn('get trap...')
    const tryRes = Reactive.tryGet(target, key, receiver)
    if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
    if (Effect.hasActive) track(target, key, get)
    const res = Reflect.get(...arguments)
    if (!isShallow && canReactive(res)) return reactive(res)
    return res
  }
}

// export { reactive as reactiveReceivor, getGetTrap }
export { getGetTrap }
