import { withRecordTrapOption } from '../../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option'
import {
  PROTOTYPE_OF_SET__MAP,
  RAW,
  TRIGGER_TYPE,
  getRaw,
  getTarget
} from '../convention'

/**
 * @param {ProxyTrapOption}
 * @returns {{delete: SetMapWsWmPrototype['delete']}}
 */
function factory({ isReadonly, trigger, reactiveInfo }) {
  const res = Object.create(null)
  Object.defineProperty(res, 'delete', {
    __proto__: null,
    value(item) {
      if (isReadonly) {
        warn(`proxy target is readonly.`)
        return false
      }
      /**@type {SetMapWsWm} */
      const target = this[RAW]
      /**@type {SetMapWsWmPrototype} */
      const proto = reactiveInfo.get(target)[PROTOTYPE_OF_SET__MAP]
      if (proto == null) throwErr(`无法获取target的原型!`)
      // 经测试,vue也是这样做的,层层剥离,获取到最原始的对象
      const _item = getRaw(item)
      // const has = target.has(item)
      // 经测试,vue在这里没有关心用户自定义的has方法
      const has = proto.has.call(target, _item)
      // const res = proto.delete.call(target, item)
      // 防止用户自定义的方法被覆盖
      const res = target.delete(_item)
      if (has) {
        // NOTE: 这里谁是`key`? value???
        // 对Set和Map的操作其中只有size属性和has方法要收集依赖
        // size属性依赖于ITERATE_KEY
        // 而has方法不应依赖于ITERATE_KEY,因为
        // has只查找特定的item, 对于Set来讲item就是value,而
        // 对于Map来讲item就是key,
        // 若依赖于ITERATE_KEY,那么任意item的增删都会触发has的重新调用, 不妥
        // 所以对于Set来讲,has查找的特定item,就是要收集的key
        const key = _item // isSet ? undefined : item
        trigger(target, key, TRIGGER_TYPE.DELETE, undefined, false)
      }
      return res
    },
    enumerable: true
  })
  return res
}

// /**@type {typeof factory} */
// const reactive = factory.bind(null, false)
// /**@type {typeof factory} */
// const readonly = factory.bind(null, true)

/**@param {ProxyTrapOption} */
export default function ({
  isReadonly,
  isShallow,
  trigger,
  reactiveInfo,
  version
}) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getCommonDeleteProxy',
    option: isReadonly ? undefined : { __proto__: null, trigger, reactiveInfo }
  })
}
