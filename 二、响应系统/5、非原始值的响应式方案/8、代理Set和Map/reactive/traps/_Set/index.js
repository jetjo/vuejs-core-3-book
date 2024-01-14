import getAdd from './add.js'
import getDelete from '../Common/delete.js'
import getHas from '../Common/has.js'
import getSize from '../Common/size.js'
import getClear from '../SetMap/clear.js'
import { withRecordTrapOption } from '../../../../../reactive/traps/option.js'
import { assignOwnDescriptors } from '../../../../../utils/index.js'

/**
 * @returns {SetProto}
 */
function factory({ add, delete: del, has, clear, size }) {
  const res = Object.create(null)
  assignOwnDescriptors(res, add, del, has, clear, size)
  return res
}

/**@param {ProxyTrapOption} option */
export default function (option) {
  const add = getAdd(option)
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
    factoryName: 'getSetPrototype',
    add,
    delete: del,
    has,
    clear,
    size
  })
}
