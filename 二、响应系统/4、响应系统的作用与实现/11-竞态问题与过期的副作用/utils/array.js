import { error, throwErr } from './log.js'

const INDEX_MAX = Math.pow(2, 32) - 2
const INDEX_MIN = 0
const Array_MaxLen = INDEX_MAX + 1

const REG_RULE = /^[1-9]\d{0,}$/

/**
 * @param {string} key 属性名
 * @param {boolean} [thr=false] 是否抛出
 *  */
function isValidArrayIndex(key, thr = false) {
  const errLog = thr ? throwErr : error
  if (typeof key !== 'string') {
    errLog('参数key必须是字符串!')
    // NOTE: 如果key是symbol,将其隐式转换为字符串或数字会抛出异常,
    // 例如`REG_RULE.test(key)`或`Number(key)`
    return false
  }
  if (key !== '0' && !REG_RULE.test(key)) return false
  const index = Number(key)
  if (isNaN(index)) return false
  if (index < INDEX_MIN) return false
  if (index > INDEX_MAX) return false
  return true
}

export { isValidArrayIndex, Array_MaxLen }
