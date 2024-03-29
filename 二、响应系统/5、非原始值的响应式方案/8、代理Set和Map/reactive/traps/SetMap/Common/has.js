import { throwErr } from '../barrel-utils.js'
import { withRecordTrapOption } from '../barrel-option.js'
import { PROTOTYPE, RAW, toRaw } from '../barrel-convention.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{has: SetMapWsWmPrototype['has']}}
 */
function factory({ track, reactiveInfo, Effect, isReadonly }) {
  const res = Object.create(null)
  Object.defineProperty(res, 'has', {
    __proto__: null,
    value(item) {
      /**@type {SetMapWsWm} */
      const target = this[RAW]
      /**@type {SetMapWsWmPrototype} */
      const proto = reactiveInfo.get(target)[PROTOTYPE]
      if (proto == null) throwErr(`无法获取target的原型!`)
      // 经测试,vue也是这样做的,层层剥离,获取到最原始的对象
      const _item = toRaw(item)
      // const has = proto.has.call(target, item)
      // 考虑到target可能有自定义的has方法,因此不能直接调用原型上的has方法,避免覆盖用户代码
      // 经测试确认,vue也是这样并没有传递自定义方法需要的所有参数
      const has = target.has(_item) // (...arguments)
      const key = _item // isSet ? undefined : item
      // 经测试确认,当参数列表长度大于1时,vue也没有track
      if (!isReadonly && Effect.hasActive && arguments.length === 1)
        track(target, key)
      return has
    },
    enumerable: true
  })
  return res
}

/**@param {ProxyTrapOption} */
export default function ({
  isShallow,
  isReadonly,
  track,
  reactiveInfo,
  version,
  Effect
}) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    isSetOrMap: true,
    version,
    reactiveInfo,
    factoryName: 'getCommonHasProxy',
    option: isReadonly ? undefined : { __proto__: null, track, Effect }
  })
}
