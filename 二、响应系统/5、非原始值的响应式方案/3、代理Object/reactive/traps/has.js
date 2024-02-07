/**@param {ProxyTrapOption} [option] */
function getHasTrap(option = {}) {
  const { Effect, track } = option

  /**@type {ProxyHandler['has']} */
  const has = function has(target, p) {
    if (Effect.hasActive) track(target, p, has)
    return Reflect.has(target, p)
  }

  return has
}

export default getHasTrap
