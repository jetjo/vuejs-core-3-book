import { withRecordTrapOption } from '#reactive/traps/option.js'
import { warn } from '#utils'
import { TRIGGER_TYPE } from './convention.js'

/**@type {TrapFactory<'defineProperty'>} */
function factory({ isReadonly, trigger, version }) {
  return function deleteProperty(target, p) {
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
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, trigger, version }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getDeleteTrap',
    option: isReadonly ? undefined : { __proto__: null, trigger }
  })
}
