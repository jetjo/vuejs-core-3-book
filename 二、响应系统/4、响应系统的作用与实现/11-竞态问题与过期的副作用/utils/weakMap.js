import { throwErr } from './log.js'
import { isGlobalSymbol, isNonRegSymbol } from './symbol.js'

/**
 * @description 要求是合法的WeakMap key、WeakSet item
 * @returns { never|boolean }
 * @throws */
function requireValidKey(key, isThrow = true) {
  const type = typeof key
  // 排除
  if (
    (type === 'object' && key !== null) ||
    type === 'function' ||
    // 全局的Symbol会阻止垃圾回收,
    // 违背WeakMap不阻止垃圾回收的特性
    isNonRegSymbol(key)
  )
    return true
  if (isThrow) throwErr('不是有效的WeakMap键!')
  return false
  // 穷举,不易读
  {
    if (
      (type !== 'object' && type !== 'function' && type !== 'symbol') ||
      null === key ||
      isGlobalSymbol(key)
    ) {
      if (isThrow) throwErr('不是有效的WeakMap键!')
      return false
    }
    return true
  }
}

export { requireValidKey as requireWeakItem }
