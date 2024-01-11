import { runWithRecord } from '../../utils/record'

const factoryMap = new WeakMap()

/**@type {WithRecordTrapOption} */
function withRecordTrapOption({
  factory,
  factoryName,
  getDiff,
  isShallow,
  isReadonly,
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
        reactive(o) {
          o.isShallow = false
          o.isReadonly = false
          return factory(o)
        },
        readonly(o) {
          o.isShallow = false
          o.isReadonly = true
          return factory(o)
        },
        shallowReactive(o) {
          o.isShallow = true
          o.isReadonly = false
          return factory(o)
        },
        shallowReadonly(o) {
          o.isShallow = true
          o.isReadonly = true
          return factory(o)
        }
      })
    )
  }
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
