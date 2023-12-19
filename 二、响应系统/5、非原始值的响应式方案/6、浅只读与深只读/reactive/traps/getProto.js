import { error, warn } from '../../../index.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['getPrototypeOf']}
 */
function getGetProtoTrap(options = {}) {
  const { handleProto, Reactive } = options
  if (!handleProto) return undefined
  warn('get getProto trap...')
  return function getPrototypeOf(target) {
    warn('getProto trap...')
    return Reactive.tryGetProto(target)
  }
}

export { getGetProtoTrap }
