import { withRecordTrapOption } from '../../../../reactive/traps/option.js'
import getSet from './_Set/index.js'
import getMap from './_Map/index.js'

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
  const map = getMap(option)
  return withRecordTrapOption({
    factory,
    set,
    map,
    isShallow: option.isShallow,
    isReadonly: option.isReadonly,
    version: option.version,
    factoryName: 'getSetMapInstrumentations'
  })
}
