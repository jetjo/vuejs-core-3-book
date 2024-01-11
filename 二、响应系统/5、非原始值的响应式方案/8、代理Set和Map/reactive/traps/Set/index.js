import getAdd from './add.js'
import getDelete from '../Common/delete.js'
import getHas from '../Common/has.js'
import getClear from '../SetMap/clear.js'
import { withRecordTrapOption } from '../../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'

/**
 * @returns {SetProto}
 */
function factory({ add, delete: del, has, clear }) {
  const res = Object.create(null)
  Object.assign(res, add, del, has, clear)
  return res
}

/**@param {ProxyTrapOption} option */
export default function (option) {
  const add = getAdd(option)
  const del = getDelete(option)
  const has = getHas(option)
  const clear = getClear(option)
  return withRecordTrapOption({
    factory,
    isShallow: option.isShallow,
    isReadonly: option.isReadonly,
    version: option.version,
    factoryName: 'getSetPrototype',
    add,
    delete: del,
    has,
    clear
  })
}
