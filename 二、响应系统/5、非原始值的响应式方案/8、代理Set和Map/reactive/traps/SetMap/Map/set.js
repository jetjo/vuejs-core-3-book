import { warn, throwErr } from '../barrel-utils.js'
import { withRecordTrapOption } from '../barrel-option.js'
import { PROTOTYPE, RAW, TRIGGER_TYPE, toRaw } from '../barrel-convention.js'
import { canTrigger } from '../barrel-track-trigger.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{set: MapWmPrototype['set']}}
 */
function factory({ isReadonly, reactiveInfo, trigger }) {
  const res = Object.create(null)
  if (!isReadonly) {
    Object.defineProperty(res, 'set', {
      value(key, value) {
        /**@type {MapWmPrototype} */
        const target = this[RAW]
        const tartoRaw = toRaw(target)
        // TODO: reactiveInfo.get(tartoRaw)[PROTOTYPE]
        /**@type {MapWmPrototype} */
        const proto = reactiveInfo.get(target)[PROTOTYPE]
        if (proto == null) throwErr(`无法获取target的原型!`)
        // 经测试,vue也是这样做的,层层剥离,获取到最原始的对象
        const rawKey = toRaw(key)
        const rawValue = toRaw(value)
        const has = proto.has.call(tartoRaw, rawKey)
        const type = has ? TRIGGER_TYPE.SET : TRIGGER_TYPE.ADD
        const oldValue = proto.get.call(tartoRaw, rawKey)
        target.set(rawKey, rawValue)
        if (canTrigger(oldValue, rawValue, target, this)) {
          // trigger(target, rawKey, type)
          trigger(tartoRaw, rawKey, type, rawValue, false)
        }
        return this
      },
      enumerable: true
    })
    return res
  }
  if (isReadonly) {
    Object.defineProperty(res, 'set', {
      value() {
        warn(`无法给只读的Map实例添加新的属性!`)
        return this
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
  trigger,
  reactiveInfo
}) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    isSetOrMap: true,
    version,
    factoryName: 'getMapSetProxy',
    option: isReadonly ? undefined : { __proto__: null, reactiveInfo, trigger }
  })
}
