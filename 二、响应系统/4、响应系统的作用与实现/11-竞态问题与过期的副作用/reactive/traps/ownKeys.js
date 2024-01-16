import { ITERATE_KEY } from './convention.js'

/**
 * @param {Object} options
 * @param {import('../index.js').EffectM} options.Effect
 * @param {import('../index.js').Track} options.track
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
