import { error, warn } from '../../utils/index.js'

/**
 * @param {Object} options
 * @param {boolean} options.handleProto
 * @param {import('../index.js').ReactiveCtor} options.Reactive
 * @returns {ProxyHandler['getPrototypeOf']}
 */
function getGetProtoTrap(options = {}) {
  warn('get getProto trap...')
  const { handleProto, Reactive } = options
  if (!handleProto) return undefined
  return function getPrototypeOf(target) {
    warn('getProto trap...')
    return Reactive.tryGetProto(target)
  }
}

export { getGetProtoTrap }
