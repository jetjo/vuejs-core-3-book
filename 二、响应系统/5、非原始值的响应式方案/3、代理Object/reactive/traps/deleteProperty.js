import { TRIGGER_TYPE } from '../../../convention.js'

/**@param {import('../../../index.js').ProxyTrapOption} [options]  */
function getDeleteTrap(options = {}) {
  const { trigger } = options
  /**@type {ProxyHandler['deleteProperty']} */
  const deleteProperty = function deleteProperty(target, p) {
    const desc = Reflect.getOwnPropertyDescriptor(target, p)
    if (typeof desc === 'undefined') return true
    const suc = Reflect.deleteProperty(target, p)
    if (suc) {
      trigger(target, p, TRIGGER_TYPE.DELETE)
    }
    return suc
  }
  return deleteProperty
}

export { getDeleteTrap }
