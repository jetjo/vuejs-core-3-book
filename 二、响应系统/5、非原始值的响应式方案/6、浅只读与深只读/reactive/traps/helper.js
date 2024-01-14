export * from '../../../../reactive/traps/helper/4-11.js'
import {
  requireReactiveTarget,
  canReactive,
  canReadonly,
  isHasTrap,
  isGetTrap,
  isSetTrap
} from '../../../../reactive/traps/helper/4-11.js'
import { throwErr } from '../../../index.js'

/**@typedef {import('../index.js').ProxyTrapOption} ProxyTrapOption */

/**@typedef {ProxyHandler<any>} PH */

/**@type {(keyof PH)[]} */
const ProxyHandlerNames = [
  'apply',
  'construct',
  'defineProperty',
  'deleteProperty',
  'get',
  // 'get value',
  'getOwnPropertyDescriptor',
  'getPrototypeOf',
  'has',
  'isExtensible',
  'ownKeys',
  'preventExtensions',
  'set',
  // 'set value',
  'setPrototypeOf'
]

const undefinedTraps = new Map()
function UndefinedTrapName(name) {
  // Object.setPrototypeOf(this, UndefinedTrapName)
  // if (new.target === undefined) return new UndefinedTrapName(name)
  if (!ProxyHandlerNames.includes(name)) name = ''
  if (name === '') {
    // NOTE: 如果使用new调用, 这里返回什么都会被忽略,总是返回this
    return
  }
  let res = undefinedTraps.get(name)
  if (res === undefined) {
    undefinedTraps.set(
      name,
      (res = {
        // [name]: function () {}
        // NOTE: 这样无论如何也不能用new调用了
        [name]() {}
      }[name])
    )
  }
  Object.setPrototypeOf(res, UndefinedTrapName) // .prototype)
  return Object.freeze(res)
}
// delete UndefinedTrapName.prototype.constructor
Object.defineProperty(UndefinedTrapName, Symbol.toStringTag, {
  get() {
    return 'UndefinedTrapName'
  }
})
Object.defineProperty(UndefinedTrapName, 'isUndefined', {
  get() {
    return undefinedTraps.get(this.name) === this
  }
})
Object.defineProperty(UndefinedTrapName, Symbol.toPrimitive, {
  // TypeError: Cannot convert a Symbol value to a string
  // Object.defineProperty(this, [Symbol.toPrimitive], {
  value() {
    return ProxyHandlerNames.includes(this.name) ? this.name : ''
    return Object.is(this, UndefinedTrapName) ? '' : this.name
    return typeof this === 'function' ? this : UndefinedTrapName //
  }
})
Object.defineProperty(UndefinedTrapName, 'toString', {
  value() {
    return ProxyHandlerNames.includes(this.name) ? this.name : ''
    return this.name //this[Symbol.toPrimitive]
  }
})
// const test = new UndefinedTrapName() + ''

function getTrapName(trap) {
  // 当`ProxyTrapOption.handleProto`设置为false时, `getGetProtoTrap`返回的`getPrototypeOf`trap是undefined
  if (typeof trap === 'undefined') return
  if (typeof trap !== 'function') throwErr('数组元素必须是函数!')
  const trapName = trap.name.split(' ').at(-1)
  if (!ProxyHandlerNames.includes(trapName))
    throwErr('函数的名称必须是ProxyHandler成员名之一!')
  return trapName
}

getTrapName.Names = ProxyHandlerNames

/**
 * @param {(PH[keyof PH])[]} traps
 * @returns {PH} */
function createProxyHandler(traps) {
  if (!Array.isArray(traps)) throwErr('参数必须是数组!')
  const res = Object.create(null)
  traps.forEach(trap => {
    const trapName = getTrapName(trap)
    if (trapName === undefined) return
    if (trap.isUndefined) {
      delete res[trapName]
      return
    }
    res[trapName] = trap
  })
  return res
}

export {
  requireReactiveTarget,
  canReactive,
  canReadonly,
  isHasTrap,
  isGetTrap,
  isSetTrap,
  getTrapName,
  createProxyHandler,
  UndefinedTrapName
}
