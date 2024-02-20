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
    thr && errLog('参数key必须是字符串!')
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

/**@param {*} fill  */
function createArray(len, fill = i => i, remainEmpty = false) {
  const arr = Array(len)
  if (remainEmpty) return arr
  if (typeof fill !== 'function') {
    arr.fill(fill)
    return arr
  }
  for (let i = 0; i < len; i++) {
    arr[i] = fill(i)
  }
  return arr
}

/**
 * @param {number[]} arr
 * @see https://en.wikipedia.org/wiki/Longest_increasing_subsequence
 */
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}


export { isValidArrayIndex, Array_MaxLen, createArray, getSequence }
