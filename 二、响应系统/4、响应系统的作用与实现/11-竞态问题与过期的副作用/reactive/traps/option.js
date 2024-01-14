import { runWithRecord } from '../../utils/record'

const factoryMap = new WeakMap()

const initFactoryRecord = (factory, isSetOrMap) => ({
  __proto__: null,
  reactive(o) {
    o.isShallow = false
    o.isReadonly = false
    o.isSetOrMap = isSetOrMap
    return factory(o)
  },
  readonly(o) {
    o.isShallow = false
    o.isReadonly = true
    o.isSetOrMap = isSetOrMap
    return factory(o)
  },
  shallowReactive(o) {
    o.isShallow = true
    o.isReadonly = false
    o.isSetOrMap = isSetOrMap
    return factory(o)
  },
  shallowReadonly(o) {
    o.isShallow = true
    o.isReadonly = true
    o.isSetOrMap = isSetOrMap
    return factory(o)
  }
})

/**@type {WithRecordTrapOption} */
function withRecordTrapOption({
  factory,
  factoryName,
  getDiff,
  isShallow,
  isReadonly,
  isSetOrMap,
  version,
  option,
  ...otherOption
}) {
  // 对于null和undefined,Object.assign不会报错
  option = Object.assign(Object.create(null), option, otherOption)
  let factoryRecord = factoryMap.get(factory)
  if (factoryRecord === undefined) {
    factoryMap.set(
      factory,
      (factoryRecord = {
        __proto__: null,
        default: initFactoryRecord(factory),
        setOrMap: initFactoryRecord(factory, true)
      })
    )
  }
  factoryRecord = isSetOrMap ? factoryRecord.setOrMap : factoryRecord.default
  const _factory = isShallow
    ? isReadonly
      ? factoryRecord.shallowReadonly
      : factoryRecord.shallowReactive
    : isReadonly
      ? factoryRecord.readonly
      : factoryRecord.reactive
  return runWithRecord({
    factory: _factory,
    factoryName,
    version,
    getDiff,
    ...option
  })
}

export { withRecordTrapOption }
