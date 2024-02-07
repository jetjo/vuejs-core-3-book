import { TRIGGER_TYPE } from '#reactive-convention/4-11.js'

/**@param {ProxyTrapOption} [option]  */
function getDeleteTrap(option = {}) {
  const { trigger } = option
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

export default getDeleteTrap
