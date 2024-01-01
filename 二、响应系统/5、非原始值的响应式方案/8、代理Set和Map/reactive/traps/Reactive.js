// export * from '../../../7、代理数组/reactive/traps/Reactive.js'

import { PROTOTYPE_OF_BuildIn_SET__MAP } from './convention.js'

import { getReactive as _getReactive } from '../../../7、代理数组/reactive/traps/Reactive.js'
import { TRY_PROXY_NO_RESULT, ITERATE_KEY } from './convention.js'
import {
  log,
  throwErr,
  warn,
  error
} from '../../../../4、响应系统的作用与实现/index.js'
import {
  getLastCallRecord,
  requireRegularOption,
  saveRecord
} from '../../../6、浅只读与深只读/reactive/traps/options/helper.js'

function getReactive(options = {}) {
  const _Reactive = _getReactive(options)

  const _options = { __proto__: null, ...options, _Reactive }
  // prettier-ignore
  const { lastCallRecord, isSameCall } = getLastCallRecord(_options, getReactive)
  // log(lastCallRecord.type, isSameCall, 'getReactive, 8')
  if (isSameCall) return lastCallRecord.result
  // prettier-ignore
  const { isShallow, isReadonly, track, trigger, reactiveInfo, Effect, reactiveApi } = requireRegularOption(_options)

  const requiredOptions = {
    __proto__: null,
    isShallow,
    isReadonly,
    track,
    trigger,
    reactiveInfo,
    Effect,
    reactiveApi,
    _Reactive
  }

  class Reactive extends _Reactive {
    constructor(...args) {
      super(...args)
    }
    static tryGet(target, key, receiver, isSetOrMap = false) {
      const tryRes = super.tryGet(target, key, receiver)
      if (tryRes !== TRY_PROXY_NO_RESULT || !isSetOrMap) return tryRes

      if (Object.hasOwn(target, key)) {
        const res = Reflect.get(target, key, receiver)
        if (Effect.hasActive) track(target, key)
        if (typeof res === 'function') {
          // 假如函数中有对Set.prototype的方法的调用,又因this无法指向proxy,这种调用无法拦截!
          if (res.name.startsWith('bound ')) error('不应该是bound函数!!!')
          // const deCompile = Function.prototype.toString.call(res)
        }
        return res
      }
      // 没法确定所访问的属性是否涉及到读取[[SetData]]或[[MapData]],
      // 假如涉及到,第三个参数不能是receiver,因为receiver就是proxy,proxy没有部署这些内部槽,
      // 会抛出异常
      const preRes = Reflect.get(target, key, target)
      return this.tryGetForSetOrMap(target, key, receiver, preRes)
    }

    static tryGetForSetOrMap(target, key, receiver, preRes) {
      const res = preRes
      if (typeof res !== 'function') {
        if (key !== 'size') error('key should only be size')
        if (Effect.hasActive) track(target, ITERATE_KEY)
        return res
      }
      throwErr('此功能正在路上...')
      // TODO: add delete has
      return TRY_PROXY_NO_RESULT
    }
  }
  saveRecord(requiredOptions, Reactive, getReactive)
  return Reactive
}

export { getReactive }
