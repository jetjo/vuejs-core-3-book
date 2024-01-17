import getGet from './get.js'
import getSet from './set.js'
import getDelete from '../Common/delete.js'
import getHas from '../Common/has.js'
import getSize from '../size.js'
import getClear from '../clear.js'
import getForEach from '../forEach.js'
import getIterator from '../forof/index.js'
import getValues from '../forof/values.js'
import getKeys from '../forof/keys.js'
import { withRecordTrapOption } from '../barrel-option.js'
import { assignOwnDescriptors } from '../barrel-utils.js'

/**
 * @returns {MapProto}
 */
function factory({
  get,
  set,
  delete: del,
  has,
  clear,
  size,
  forEach,
  iterator,
  values,
  keys
}) {
  const res = Object.create(null)
  assignOwnDescriptors(
    res,
    get,
    set,
    del,
    has,
    clear,
    size,
    forEach,
    iterator,
    values,
    keys
  )
  return res
}

/**@param {ProxyTrapOption} option */
export default function (option) {
  const get = getGet(option)
  const set = getSet(option)
  const del = getDelete(option)
  const has = getHas(option)
  const clear = getClear(option)
  const size = getSize(option)
  const forEach = getForEach(option)
  const iterator = getIterator(option)
  const values = getValues(option)
  const keys = getKeys(option)
  return withRecordTrapOption({
    factory,
    isShallow: option.isShallow,
    isReadonly: option.isReadonly,
    isSetOrMap: true,
    version: option.version,
    factoryName: 'getMapPrototype',
    get,
    set,
    delete: del,
    has,
    clear,
    size,
    forEach,
    iterator,
    values,
    keys
  })
}
