import { warn } from '../../../index.js'
import { TRIGGER_TYPE, SceneProtectedFlag } from './convention.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['deleteProperty']}
 * */
function getDeleteTrap(options = {}) {
  const { trigger, isReadonly } = options

  function withSceneStatus(restore = true, ...args) {
    const cb = trigger
    const bak = {
      __proto__: null,
      get [SceneProtectedFlag]() {
        return true
      }
    }
    if (!restore) return cb.apply(bak, args)
    try {
      return cb.apply(bak, args)
    } finally {
    }
  }

  /**@type {ProxyHandler['deleteProperty']} */
  const deleteProperty = function deleteProperty(target, p) {
    if (isReadonly) {
      warn(`不能删除只读状态对象的属性!`)
      return true
    }
    const desc = Reflect.getOwnPropertyDescriptor(target, p)
    if (typeof desc === 'undefined') return true
    const suc = Reflect.deleteProperty(target, p)
    if (suc) {
      withSceneStatus(false, target, p, TRIGGER_TYPE.DELETE)
      // trigger(target, p, TRIGGER_TYPE.DELETE)
    }
    return suc
  }
  return deleteProperty
}

export { getDeleteTrap }
