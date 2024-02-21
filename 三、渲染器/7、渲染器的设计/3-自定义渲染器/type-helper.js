import { throwErr, isDev, error } from '#root/utils'

/**@description 用于切断类型连接,设置缺省值 */
// @ts-ignore
function setValOfFnType(o, key = '', func, message) {
  o[key] ||=
    func ||
    (() => {
      if (isDev) error(message || 'Not implemented yet!')
      else throwErr(message || 'Not implemented yet!')
    })
}
/**@description 用于切断类型连接 */
// @ts-ignore
function getValOfFnType(o, key = '') {
  return (
    o[key] ||
    (() => {
      throw new Error('Not implemented yet!')
    })
  )
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

/**@type {AssertUnknowns} */
function assertUnknowns(validate, ...value) {
  // @ts-ignore
  if (validate && !validate(...value)) throw new Error('failed')
  return
}

/**@type {VVNode} */
const defVNode = {
  type: '',
  props: null,
  key: null,
  ref: null,
  /**
   * SFC only. This is assigned on vnode creation using currentScopeId
   * which is set alongside currentRenderingInstance.
   */
  scopeId: null,
  children: null,
  component: null,
  dirs: null,
  transition: null,
  el: null,
  anchor: null,
  target: null,
  targetAnchor: null,
  suspense: null,
  shapeFlag: 0,
  patchFlag: 0,
  appContext: null
}

export {
  setValOfFnType,
  getValOfFnType,
  requireCallable,
  requireEventHandler,
  assertUnknown,
  assertUnknownEx,
  assertUnknowns,
  defVNode
}
