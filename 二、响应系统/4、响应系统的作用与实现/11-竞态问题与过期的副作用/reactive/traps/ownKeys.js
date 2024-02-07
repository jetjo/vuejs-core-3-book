import { ITERATE_KEY } from './convention.js'

/**
 * @param {Object} options
 * @param {EffectM} options.Effect
 * @param {Track} options.track
 * @returns {ProxyHandler['ownKeys']}
 */
function getOwnKeysTrap(options = {}) {
  const { Effect, track } = options //TODO:
  return function ownKeys(target) {
    if (Effect.hasActive) track(target, ITERATE_KEY, ownKeys)
    return Reflect.ownKeys(target)
  }
}

export { getOwnKeysTrap }
