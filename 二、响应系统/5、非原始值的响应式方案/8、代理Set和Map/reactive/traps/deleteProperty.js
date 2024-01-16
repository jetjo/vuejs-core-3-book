import { withRecordTrapOption } from '../../../../reactive/_traps/option.js'
import { UndefinedTrapName } from '../../../../reactive/_traps/helper/5-6.js'

/**@type {TrapFactory<'defineProperty'>} */
function factory({ isSetOrMap, deleteProperty }) {
  if (isSetOrMap) return UndefinedTrapName('deleteProperty')
  return deleteProperty
}

/**@param {ProxyTrapOption} */
export default function ({
  isShallow,
  isReadonly,
  version,
  deleteProperty,
  isSetOrMap
}) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    isSetOrMap,
    version,
    factoryName: 'getDeleteTrap',
    option: isSetOrMap ? undefined : { __proto__: null, deleteProperty }
  })
}
