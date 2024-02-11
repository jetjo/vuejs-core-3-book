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
