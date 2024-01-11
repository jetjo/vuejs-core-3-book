import { PROTOTYPE_OF_SET__MAP, RAW, TRIGGER_TYPE } from '../convention'
import { warn } from '../../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/utils'
import { withRecordTrapOption } from '../../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option'

/**
 * @param {ProxyTrapOption}
 * @returns {{clear: SetMapPrototype['clear']}}
 */
function factory({ isReadonly, trigger, reactiveInfo }) {
  const res = Object.create(null)
  Object.defineProperty(res, 'clear', {
    __proto__: null,
    value() {
      /**@type {SetMap} */
      const target = this[RAW]
      /**@type {SetMapPrototype} */
      const proto = reactiveInfo.get(target)[PROTOTYPE_OF_SET__MAP]
      if (proto == null) throwErr(`无法获取target的原型!`)
      if (isReadonly) {
        warn(`${proto === Set.prototype ? 'Set' : 'Map'} is readonly.`)
        return
      }
      target.clear()
      const newSize = Reflect.get(proto, 'size', target)
      // console.log({ newSize }) //ok
      if (newSize !== 0) return
      trigger(target, undefined, TRIGGER_TYPE.CLEAR, undefined, false)
    },
    enumerable: true
  })
  return res
}

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
    reactiveInfo,
    factoryName: 'getClearProxy',
    option: isReadonly ? undefined : { __proto__: null, trigger }
  })
}
