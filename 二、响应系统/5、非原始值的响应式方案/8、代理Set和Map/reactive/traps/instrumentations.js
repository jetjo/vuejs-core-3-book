import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option'
import getSet from './_Set/index.js'

function factory({ set, map, weakSet, weakMap }) {
  const res = new WeakMap()
  res.set(Set.prototype, set)
  res.set(Map.prototype, map)
  res.set(WeakSet.prototype, weakSet)
  res.set(WeakMap.prototype, weakMap)
  return res
}

/**@param {ProxyTrapOption} option */
export default function (option) {
  const set = getSet(option)
  return withRecordTrapOption({
    factory,
    set,
    isShallow: option.isShallow,
    isReadonly: option.isReadonly,
    version: option.version,
    factoryName: 'getSetMapInstrumentations'
  })
}
