import {
  requireProxyTarget,
  requireWeakItem,
  throwErr
} from '../../utils/index.js'
import { isReactive, isReadonlyReactive } from './convention.js'

/**
 * @description 要求是合法有效的代理目标
 * @param {any} v 打算代理的目标对象
 * @param {boolean} f 是否抛出
 * @returns { boolean|never }
 * @throws */
const requireTarget = (v, f = true) =>
  v &&
  // typeof v !== 'function' &&
  typeof v === 'object' &&
  // (typeof v === 'object' || typeof v === 'function') &&
  requireWeakItem(v, f) &&
  requireProxyTarget(v, f)

const canReactive = v => !!v && requireTarget(v, false) && !isReactive(v)

const canReadonly = v =>
  !!v && requireTarget(v, false) && !isReadonlyReactive(v)

// /**@typedef {import('../index.js').ProxyTrapOption} ProxyTrapOption */

// /**@typedef {ProxyHandler<any>} PH */

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

/**
 * @param {(PH[keyof PH])[]} traps
 * @returns {PH} */
function getProxyHandler(traps) {
  if (!Array.isArray(traps)) throwErr('参数必须是数组!')
  const res = Object.create(null)
  traps.forEach(trap => {
    // 当`ProxyTrapOption.handleProto`设置为false时, `getGetProtoTrap`返回的`getPrototypeOf`trap是undefined
    if (typeof trap === 'undefined') return
    if (typeof trap !== 'function') throwErr('数组元素必须是函数!')
    if (!ProxyHandlerNames.includes(trap.name))
      throwErr('函数的名称必须是ProxyHandler成员名之一!')
    res[trap.name] = trap
  })
  return res
}

/**
 * @callback HandleTrapGetter
 * @param {ProxyTrapGetter} trapGetter
 */
/**
 * @deprecated
 * @param {HandleTrapGetter} handleTrap  */
function doWithAllTrapGetter(trapsModule, handleTrap) {
  function* traps() {
    // const getProxyHandler = ProxyHandlerHelper.default
    for (const key in trapsModule) {
      if (Object.hasOwnProperty.call(trapsModule, key)) {
        /**@type {ProxyTrapGetter} */
        const element = trapsModule[key]
        if (typeof element !== 'function') continue
        yield element
      }
    }
  }

  for (const trap of traps()) {
    handleTrap(trap)
  }
}

function isHasTrap(trap) {
  if (typeof trap !== 'function') return false
  return trap.name === 'has'
}
function isGetTrap(trap) {
  if (typeof trap !== 'function') return false
  return trap.name === 'get' || trap.name === 'get value'
}
function isSetTrap(trap) {
  if (typeof trap !== 'function') return false
  return trap.name === 'set' || trap.name === 'set value'
}

function setReactiveApiFlag(api, flag) {
  const flagKeys = Object.keys(flag)
  flagKeys.forEach(key => {
    Object.defineProperty(api, key, {
      value: flag[key],
      writable: false,
      configurable: false,
      enumerable: false
    })
  })
}

export {
  requireTarget as requireReactiveTarget,
  canReactive,
  canReadonly,
  getProxyHandler,
  isHasTrap,
  isGetTrap,
  isSetTrap,
  setReactiveApiFlag
}
