import { error, warn, throwErr, log } from '../../../index.js'
import { TRY_PROXY_NO_RESULT, ITERATE_KEY } from './convention.js'
import { canReactive, canReadonly } from './helper.js'

// function reactive() {
//   // return reactive[INTERNAL_IMPL_KEY](...arguments)
// }
const lastCallRecord = {
  __proto__: null,
  reactive: Object.create(null),
  readonly: Object.create(null),
  shallowReactive: Object.create(null),
  shallowReadonly: Object.create(null)
  // reactive, isShallow, Effect, track, Reactive, isReadonly, readonly, get
}
/**
 * @param {import('../index.js').ProxyTrapOption} [options]
 * @returns {ProxyHandler['get']}
 */
function getGetTrap(options = {}) {
  // warn('get get trap...')
  // 使用行内注释禁用prettier格式化
  // prettier-ignore
  const {
    isShallow,
    Effect,
    track,
    Reactive,
    isReadonly,
    // reactive,
    // readonly
  } = options

  function regularOption() {
    if (isShallow) {
      delete options.reactive
      delete options.readonly
      return
    }

    if (isReadonly) {
      delete options.reactive
      return
    }

    delete options.readonly
  }

  function requiredApi() {
    if (isShallow) return

    if (isReadonly) {
      if (readonly == null) throwErr('缺少必需的readonly API!')
      return
    }

    if (reactive == null) throwErr('缺少必需的reactive API!')
  }

  regularOption()

  const { reactive, readonly } = options

  requiredApi()

  const _lastCallRecord = isShallow
    ? isReadonly
      ? lastCallRecord.shallowReadonly
      : lastCallRecord.shallowReactive
    : isReadonly
      ? lastCallRecord.readonly
      : lastCallRecord.reactive
  const isSameCall =
    // isShallow === _lastCallRecord.isShallow &&
    // isReadonly === _lastCallRecord.isReadonly &&
    Reactive === _lastCallRecord.Reactive &&
    Effect === _lastCallRecord.Effect &&
    track === _lastCallRecord.track &&
    reactive === _lastCallRecord.reactive &&
    readonly === _lastCallRecord.readonly

  if (isSameCall) return _lastCallRecord.get
  Object.assign(_lastCallRecord, options)
  if (isReadonly) {
    const get = function get(target, key, receiver) {
      const tryRes = Reactive.tryGet(target, key, receiver)
      if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
      log('get trap...')
      const res = Reflect.get(...arguments)
      if (!isShallow && canReadonly(res)) return readonly(res)
      return res
    }
    get.trapForSetAndMap = function get(target, key, receiver) {
      const tryRes = Reactive.tryGet(target, key, receiver)
      if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
      warn('get trap..., for set or map')
      // if (key !== 'size') warn('key should only be size')
      const res = Reflect.get(target, key, target)
      // const tryRes1 = Reactive.tryGetForSetOrMap(target, key, receiver, res)
      // if (tryRes1 !== TRY_PROXY_NO_RESULT) return tryRes1
      if (!isShallow && canReadonly(res)) return readonly(res)
      return res
    }
    _lastCallRecord.get = get
    return get
  }

  const _ = function get(isSetOrMap, target, key, receiver) {
    const tryRes = Reactive.tryGet(target, key, receiver)
    if (tryRes !== TRY_PROXY_NO_RESULT) return tryRes
    function getRes() {
      if (isSetOrMap) {
        warn('get trap..., for set or map')
        // 没法确定所访问的属性是否涉及到读取[[SetData]]或[[MapData]],
        // 假如涉及到,第三个参数不能是receiver,因为receiver就是proxy,proxy没有部署这些内部槽,
        // 会抛出异常
        const res = Reflect.get(target, key, target)
        // const tryRes1 = Reactive.tryGetForSetOrMap(target, key, receiver, res)
        // if (tryRes1 !== TRY_PROXY_NO_RESULT) return tryRes1
        if (typeof res === 'function') {
          // 假如函数中有对Set.prototype的方法的调用,又因this无法指向proxy,这种调用无法拦截!
          if (res.name.startsWith('bound ')) error('不应该是bound函数!!!')
          // const deCompile = Function.prototype.toString.call(res)
          // log(deCompile)
          // return res
        }
        // if (key !== 'size') warn('key should only be size')
        if (Effect.hasActive) {
          track(target, ITERATE_KEY, get)
          // 没法确保所访问的属性一定是要获取Set或Map的size,因此这里只能都追踪
          track(target, key, get)
        }
        return res
      }
      log('get trap...')
      if (Effect.hasActive) track(target, key, get)
      const res = Reflect.get(target, key, receiver)
      return res
    }
    const res = getRes()
    // 定义的拦截器函数中,目前没有对Call和Constructor的拦截,所以不用代理function
    // 但是function也是一种对象,也可以有自定义属性,该如何处理??? vue如何处理的???
    if (!isShallow && canReactive(res))
      // if (!isShallow && typeof res === 'object' && canReactive(res))
      // if (!isShallow && typeof res !== 'function' && canReactive(res))
      return reactive(res)
    return res
  }

  const get = _.bind(null, false)
  get.trapForSetAndMap = _.bind(null, true)
  // get.name = 'get'

  _lastCallRecord.get = get
  return get
}

export { getGetTrap }
