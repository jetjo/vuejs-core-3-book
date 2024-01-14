import { withRecordTrapOption } from '../../../../reactive/traps/option.js'
import { UndefinedTrapName } from '../../../6、浅只读与深只读/reactive/traps/helper.js'

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
