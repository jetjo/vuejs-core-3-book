import { PROTOTYPE_OF_SET__MAP, RAW, TRIGGER_TYPE, getRaw } from '../convention'
import { warn, throwErr } from '../../../../../utils/index.js'
import { withRecordTrapOption } from '../../../../../reactive/traps/option.js'

/**
 * @param {ProxyTrapOption}
 * @returns {{add: SetWsPrototype['add']}}
 */
function factory({ isReadonly, trigger, reactiveInfo }) {
  const res = Object.create(null)
  Object.defineProperty(res, 'add', {
    __proto__: null,
    value(item) {
      if (isReadonly) {
        warn(`Set is readonly.`)
        return this
      }
      /**@type {SetWs} */
      const target = this[RAW]
      /**@type {SetWsPrototype} */
      const proto = reactiveInfo.get(target)[PROTOTYPE_OF_SET__MAP]
      if (proto == null) throwErr(`无法获取target的原型!`)
      // 经测试,vue也是这样做的,层层剥离,获取到最原始的对象
      const _item = getRaw(item)
      // vue也没有关心用户自定义的has方法
      const has = proto.has.call(target, _item)
      // proto.add.call(target, value)
      // vue也没有关心自定义的add方法的返回结果,而是遵循add原型方法的返回
      target.add(_item)
      if (!has) {
        const key = _item // undefined // NOTE: 这里谁是`key`? value???
        trigger(target, key, TRIGGER_TYPE.ADD, undefined, false)
      }
      return this // res
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
    factoryName: 'getSetAddProxy',
    option: isReadonly ? undefined : { __proto__: null, trigger, reactiveInfo }
  })
}
