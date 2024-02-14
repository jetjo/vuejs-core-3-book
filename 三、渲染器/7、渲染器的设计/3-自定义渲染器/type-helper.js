/**@typedef {import('#shims').RendererCreatorFactoryConfig} RendererCreatorFactoryConfig */
/**@typedef {import('#shims').IsAllDefined<RendererCreatorFactoryConfig>} isValidRendererCreatorFactoryConfig */

import { defArg0 } from '#root/utils'

/**@type {isValidRendererCreatorFactoryConfig} */
function isAllDefined(config = defArg0, ignors = []) {
  const _config = { ...config }
  ignors?.forEach(key => delete _config[key])
  for (const value of Object.values(_config)) {
    if (value === undefined) return false
  }
  return true
}

/**@type {isValidRendererCreatorFactoryConfig} */
function markAllDefined() {
  return true
}

/**@type {import('#shims').Init<RendererCreatorFactoryConfig>} */
function init(ignors = []) {
  /**@type {RendererCreatorFactoryConfig} */
  const instance = {
    // @ts-ignore
    __proto__: null,
    mountChildren: undefined,
    mountProps: undefined,
    mountElement: undefined,
    patch: undefined,
    isVNodeArrayChildrenC: undefined,
    isVNodeChildAtomC_VVNode: undefined,
    render: () => {
      throw new Error('render is not implemented')
    },
    hydrate: () => {
      throw new Error('hydrate is not implemented')
    }
  }
  for (const igK of ignors) {
    delete instance[igK]
  }
  return instance
}

export const RendererCreatorFactoryConfig = {
  isAllDefined,
  markAllDefined,
  init
}

/**@description 用于切断类型连接,设置缺省值 */
// @ts-ignore
function setValOfFnType(o, key = '', func) {
  o[key] ||=
    func ||
    (() => {
      throw new Error('Not implemented yet!')
    })
}

/**@type {RequireFunction}  */
function requireCallable(fn) {
  if (typeof fn !== 'function') throw new Error('fn must be a function')
}

export { setValOfFnType, requireCallable }
