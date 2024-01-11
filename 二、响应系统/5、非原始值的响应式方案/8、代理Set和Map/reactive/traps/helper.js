import {
  requireReactiveTarget,
  canReactive,
  canReadonly,
  isHasTrap,
  isGetTrap,
  isSetTrap,
  getTrapName as _getTrapName,
  createProxyHandler as _getProxyHandler
} from '../../../7、代理数组/reactive/traps/helper.js'
// import { isReadonlyReactive } from './convention.js'

// const canReadonly = v =>
//   requireReactiveTarget(v, false) && !isReadonlyReactive(v)

function getTrapName(trap) {
  // 当`ProxyTrapOption.handleProto`设置为false时, `getGetProtoTrap`返回的`getPrototypeOf`trap是undefined
  if (typeof trap === 'undefined') return
  if (typeof trap !== 'function') throwErr('数组元素必须是函数!')
  // if (/^(bound\s)+/.test(trap.name)) {
  const name = trap.name.replace(/^(bound\s)+/, '')
  // }
  if (!_getTrapName.Names.includes(name))
    throwErr('函数的名称必须是ProxyHandler成员名之一!')
  return name
}

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
