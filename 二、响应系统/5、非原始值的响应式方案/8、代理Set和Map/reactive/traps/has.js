import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option'
import { UndefinedTrapName } from '../../../6、浅只读与深只读/reactive/traps/helper'

/**@type {TrapFactory<'has'>} */
function factory({ isSetOrMap, has }) {
  if (isSetOrMap) return UndefinedTrapName('has')
  return has
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, version, isSetOrMap, has }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    isSetOrMap,
    factoryName: 'getHasTrap',
    option: isSetOrMap ? undefined : { __proto__: null, has }
  })
}
