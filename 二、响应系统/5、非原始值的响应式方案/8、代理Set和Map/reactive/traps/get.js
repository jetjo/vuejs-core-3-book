import { log } from '../../../index.js'
import { TRY_PROXY_NO_RESULT } from './convention.js'
import {
  getLastCallRecord,
  requireRegularOption,
  saveRecord
} from '../../../6、浅只读与深只读/reactive/traps/options/helper.js'

/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['get']}
 */
function getGetTrap(options = {}) {
  const { lastCallRecord, isSameCall } = getLastCallRecord(options, getGetTrap)
  // log(lastCallRecord.type, isSameCall, 'getGetTrap')
  if (isSameCall) return lastCallRecord.result

  // prettier-ignore
  const {
    isShallow,
    Effect,
    track,
    Reactive,
    isReadonly,
    reactiveApi,
    canReactive
  } = requireRegularOption(options)
  const requiredOptions = {
    __proto__: null,
    isShallow,
    Effect,
    track,
    Reactive,
    isReadonly,
    reactiveApi
    // canReactive
  }

  const _ = function get(isSetOrMap, target, key, receiver) {
    const tryRes = Reactive.tryGet(target, key, receiver, isSetOrMap)
    if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
    if (!isReadonly && Effect.hasActive) track(target, key)
    const res = Reflect.get(target, key, receiver)
    // 定义的拦截器函数中,目前没有对Call和Constructor的拦截,所以不用代理function
    // 但是function也是一种对象,也可以有自定义属性,该如何处理??? vue如何处理的???
    if (!isShallow && canReactive(res)) return reactiveApi(res)
    return res
  }
  const get = _.bind(null, false)
  get.trapForSetAndMap = _.bind(null, true)
  saveRecord(requiredOptions, get, getGetTrap)
  return get
}

export { getGetTrap }
