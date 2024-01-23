import { withRecordTrapOption } from '#reactive/traps/option.js'
import { UndefinedTrapName } from '#reactive/traps/helper/5-6.js'

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
