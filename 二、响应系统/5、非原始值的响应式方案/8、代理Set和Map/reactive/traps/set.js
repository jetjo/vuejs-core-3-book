import { withRecordTrapOption } from '#reactive/traps/option.js'
import { UndefinedTrapName } from '#reactive/traps/helper/5-6.js'

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
