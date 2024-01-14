import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'
import { UndefinedTrapName } from '../../../6、浅只读与深只读/reactive/traps/helper.js'

/**@type {TrapFactory<'set'>} */
function factory({ isSetOrMap, set }) {
  if (isSetOrMap) return UndefinedTrapName('set')
  return set
}

/**@param {ProxyTrapOption} */
export default function ({ isShallow, isReadonly, version, isSetOrMap, set }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    isSetOrMap,
    factoryName: 'getSetTrap',
    option: isSetOrMap ? undefined : { __proto__: null, set }
  })
}
