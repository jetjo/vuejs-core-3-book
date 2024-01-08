import {
  requireReactiveTarget,
  canReactive,
  canReadonly,
  isHasTrap,
  isGetTrap,
  isSetTrap
} from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/helper.js'
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
    if (!trapName) return
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
  createProxyHandler
}
