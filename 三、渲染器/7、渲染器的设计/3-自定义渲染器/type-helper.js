/**@typedef {import('#shims').RendererCreatorFactoryConfig} RendererCreatorFactoryConfig */
/**@typedef {import('#shims').IsAllDefined<RendererCreatorFactoryConfig>} isValidRendererCreatorFactoryConfig */

import { defArg0, throwErr } from '#root/utils'

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
    unmountChildren: undefined,
    unmount: undefined,
    patchElement: undefined,
    patchChildren: undefined,
    patch: undefined,
    isVNodeArrayChildrenC: undefined,
    isVNodeChildAtomC_VVNode: undefined,
    // @ts-ignore
    render: undefined,
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
function requireCallable(fn, msg = 'fn must be a function') {
  if (typeof fn !== 'function') throwErr(msg)
}

/**@type {RequireEventHandler} */
function requireEventHandler(fn) {
  if (Array.isArray(fn)) {
    for (const hl of fn) {
      requireCallable(hl, '事件处理器必须是函数')
    }
    return
  }
  requireCallable(fn, '事件处理器必须是函数')
}

/**@type {AssertUnknown} */
function assertUnknown(value, validate) {
  // @ts-ignore
  if (validate && !validate(value, arguments[2])) throw new Error('failed')
  return
}

/**@type {AssertUnknownEx} */
function assertUnknownEx(value, validate, ...args) {
  // @ts-ignore
  if (validate && !validate(value, ...args)) throw new Error('failed')
  return
}

export { setValOfFnType, requireCallable, requireEventHandler, assertUnknown, assertUnknownEx }
