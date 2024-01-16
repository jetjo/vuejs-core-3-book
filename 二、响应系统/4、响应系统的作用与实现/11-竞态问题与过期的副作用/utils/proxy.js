import { throwErr } from './log.js'

/**
 * @returns { never|boolean }
 * @throws */
function requireValidTarget(target, isThrow = true) {
  // 如果target本身就是proxy,
  // 那么typeof返回的是proxy目标的类型,
  // 因为typeof操作不能被代理
  const type = typeof target
  if ((type === 'object' && target !== null) || type === 'function') return true
  if (isThrow) throwErr('不是有效的代理目标!')
  return false
  {
    if ((type !== 'object' && type !== 'function') || null === target) {
      if (isThrow) throwErr('不是有效的代理目标!')
      return false
    }
    return true
  }
}

export { requireValidTarget as requireProxyTarget }
