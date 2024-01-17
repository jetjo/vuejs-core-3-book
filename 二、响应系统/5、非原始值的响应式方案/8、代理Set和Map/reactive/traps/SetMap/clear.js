import { PROTOTYPE, RAW, TRIGGER_TYPE } from '../convention.js'
import { warn, throwErr } from './barrel-utils.js'
import { withRecordTrapOption } from './barrel-option.js'

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
      const proto = reactiveInfo.get(target)[PROTOTYPE]
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
    isSetOrMap: true,
    version,
    reactiveInfo,
    factoryName: 'getClearProxy',
    option: isReadonly ? undefined : { __proto__: null, trigger }
  })
}
