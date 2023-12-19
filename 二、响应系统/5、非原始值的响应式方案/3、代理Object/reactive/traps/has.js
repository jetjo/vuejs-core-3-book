/**@param {import('../../../index.js').ProxyTrapOption} [options] */
function getHasTrap(options = {}) {
  const { Effect, track } = options

  /**@type {ProxyHandler['has']} */
  const has = function has(target, p) {
    if (Effect.hasActive) track(target, p, has)
    return Reflect.has(target, p)
  }

  return has
}

export { getHasTrap }
