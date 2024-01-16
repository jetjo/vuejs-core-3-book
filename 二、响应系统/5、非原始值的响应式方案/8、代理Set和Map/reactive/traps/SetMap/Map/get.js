import { withRecordTrapOption } from '../../../../../../reactive/_traps/option.js'
import { RAW, getRaw } from '../../convention.js'
import { canReactive, canReadonly } from '../../helper.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{get: MapWmPrototype['get']}}
 */
function factory({ isReadonly, isShallow, Effect, track, reactive, readonly }) {
  const res = Object.create(null)
  if (!isReadonly) {
    Object.defineProperty(res, 'get', {
      value(key) {
        /**@type {MapWmPrototype} */
        const target = this[RAW]
        const targetRaw = getRaw(target)
        // TODO: reactiveInfo.get(targetRaw)[PROTOTYPE]
        // const proto = reactiveInfo.get(target)[PROTOTYPE]
        // if (proto == null) throwErr(`无法获取target的原型!`)
        // 经测试,vue也是这样做的,层层剥离,获取到最原始的对象
        const rawKey = getRaw(key)
        // const has = proto.has.call(targetRaw, rawKey)
        // 考虑到target可能有自定义的`get`方法,因此不能直接调用原型上的`get`方法,避免覆盖用户代码
        // 经测试确认,vue也是这样并没有传递自定义方法需要的所有参数
        const res = target.get(rawKey) // (...arguments)
        if (Effect.hasActive) {
          // track(target, rawKey) //vue既收集了target又收集了targetRaw,为何???
          track(targetRaw, rawKey)
        }
        if (!isShallow && canReactive(res)) return reactive(res)
        return res
      },
      enumerable: true
    })
    return res
  }
  if (isReadonly) {
    Object.defineProperty(res, 'get', {
      value(key) {
        /**@type {MapWmPrototype} */
        const target = this[RAW]
        const rawKey = getRaw(key)
        const res = target.get(rawKey)
        if (!isShallow && canReadonly(res)) return readonly(res)
        return res
      },
      enumerable: true
    })
    return res
  }
}

/**@param {ProxyTrapOption} */
export default function ({
  version,
  isShallow,
  isReadonly,
  Effect,
  track,
  reactive,
  readonly
}) {
  let option
  if (!isReadonly) {
    option = isShallow
      ? { __proto__: null, track, Effect }
      : { __proto__: null, track, Effect, reactive }
  }
  if (isReadonly) {
    option = isShallow ? { __proto__: null } : { __proto__: null, readonly }
  }
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    isSetOrMap: true,
    version,
    // reactiveInfo,
    factoryName: 'getMapGetProxy',
    option
  })
}
