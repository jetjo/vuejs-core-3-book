import { withRecordTrapOption } from '#reactive/traps/option.js'
import { UndefinedTrapName } from '#reactive/traps/helper/5-6.js'

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
