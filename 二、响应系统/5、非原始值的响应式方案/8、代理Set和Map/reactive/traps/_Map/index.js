import getGet from './get.js'
import getSet from './set.js'
import getDelete from '../Common/delete.js'
import getHas from '../Common/has.js'
import getSize from '../SetMap/size.js'
import getClear from '../SetMap/clear.js'
import { withRecordTrapOption } from '../../../../../reactive/traps/option.js'
import { assignOwnDescriptors } from '../../../../../utils/index.js'

/**
 * @returns {MapProto}
 */
function factory({ get, set, delete: del, has, clear, size }) {
  const res = Object.create(null)
  assignOwnDescriptors(res, get, set, del, has, clear, size)
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
    size
  })
}
