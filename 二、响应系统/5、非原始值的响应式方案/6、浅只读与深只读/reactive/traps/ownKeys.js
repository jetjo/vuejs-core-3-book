import { ITERATE_KEY } from './convention.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['ownKeys']}
 */
function getOwnKeysTrap(options = {}) {
  const { Effect, track, isReadonly } = options //TODO:
  return function ownKeys(target) {
    if (!isReadonly && Effect.hasActive) track(target, ITERATE_KEY, ownKeys)
    return Reflect.ownKeys(target)
  }
}

export { getOwnKeysTrap }
