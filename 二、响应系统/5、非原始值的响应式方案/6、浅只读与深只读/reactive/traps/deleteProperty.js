import { warn } from '../../../index.js'
import { TRIGGER_TYPE } from './convention.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['deleteProperty']}
 * */
function getDeleteTrap(options = {}) {
  const { trigger, isReadonly } = options

  /**@type {ProxyHandler['deleteProperty']} */
  const deleteProperty = function deleteProperty(target, p) {
    if (isReadonly) {
      warn(`不能删除只读状态对象的属性!`)
      return true
    }
    const desc = Reflect.getOwnPropertyDescriptor(target, p)
    // delete 操作符只能删除对象自身的成员,不能删除原型链上的成员
    if (typeof desc === 'undefined') return true
    const suc = Reflect.deleteProperty(target, p)
    // if (suc)
    trigger(target, p, TRIGGER_TYPE.DELETE)
    return suc
  }
  return deleteProperty
}

export { getDeleteTrap }
