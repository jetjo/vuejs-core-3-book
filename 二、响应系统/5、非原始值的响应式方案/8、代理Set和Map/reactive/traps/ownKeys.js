import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'
import { UndefinedTrapName } from '../../../6、浅只读与深只读/reactive/traps/helper.js'

/**@type {TrapFactory<'ownKeys'>} */
function factory({ isSetOrMap, ownKeys }) {
  // vue也是如此
  if (isSetOrMap) return UndefinedTrapName('ownKeys')
  return ownKeys
}

/**@param {ProxyTrapOption} */
export default function ({
  isShallow,
  isReadonly,
  version,
  isSetOrMap,
  ownKeys
}) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    isSetOrMap,
    factoryName: 'getOwnKeysTrap',
    option: isSetOrMap ? undefined : { __proto__: null, ownKeys }
  })
}
