/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['has']}
 * */
function getHasTrap(options = {}) {
  const { Effect, track, isReadonly } = options

  /**@type {ProxyHandler['has']} */
  const has = function has(target, p) {
    if (!isReadonly && Effect.hasActive) track(target, p, has)
    return Reflect.has(target, p)
  }

  return has
}

export { getHasTrap }
