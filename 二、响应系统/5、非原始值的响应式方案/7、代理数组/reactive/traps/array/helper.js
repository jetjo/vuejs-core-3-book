import { log, throwErr } from '../../../../index.js'
import finds from './find.js'
import changeLens from './changeStackLength.js'
import { ITERATE_KEY_VAL, getTarget } from '../convention.js'
import {
  getLastCallRecord,
  requireRegularOption,
  saveRecord
} from '../../../../6、浅只读与深只读/reactive/traps/options/helper.js'

/**@typedef {import('./changeStackLength.js').ChangeLensType} ChangeLensType */
/**@typedef {import('./find.js').FindsType} FindsType */
/**@typedef {keyof FindsType} FindsName */
/**@typedef {keyof ChangeLensType} ChangeLensName */

/**@param {import('../../index.js').ProxyTrapOption} [options={}]  */
function getRewriter(options = {}) {
  const { lastCallRecord, isSameCall } = getLastCallRecord(options, getRewriter)
  // log(lastCallRecord.type, isSameCall, 'getRewriter')
  if (isSameCall) return lastCallRecord.result
  // prettier-ignore
  const { Effect, track, isShallow, isReadonly, reactiveApi } = requireRegularOption(options)
  const requiredOptions = {
    __proto__: null,
    isShallow,
    isReadonly,
    reactiveApi,
    Effect,
    track
  }

  /**
   * @param {{name: FindsName}} [method = {}]
   * @returns {(...args: any[]) => any}
   * @--returns {FindsType[FindsName]}
   */
  function rewriteArrayProtoFindMethod(method = {}) {
    const { name, isInvalidRes, protoImpl, isReactiveArg } = method
    const methodOrigin = protoImpl || Array.prototype[name]
    if (!methodOrigin) throwErr(`${name} is not a array prototype function`)

    return function (...args) {
      const targetRaw = getTarget(this, true)
      // if (Object.hasOwn(targetRaw, name) && targetRaw[name] !== methodOrigin) {
      //   throwErr(
      //     `can not ${name} with ${args}; 不允许数组实例覆盖其原型链上的${name}方法!!!`
      //   )
      // }
      if (Effect.hasActive) track(targetRaw, ITERATE_KEY_VAL)
      return Effect.runWithoutEffect(() => {
        if (isReactiveArg && isReactiveArg(args)) {
          return methodOrigin.apply(this, args)
        }
        // const res = methodOrigin.apply(this, args)
        // if (isInvalidRes(res)) {
        //   // throwErr(`can not ${name} with ${args}`)
        return methodOrigin.apply(targetRaw, args)
        // }
        // return res
      })
    }
  }
  rewriteArrayProtoFindMethod.arrayMethods = finds
  // rewriteArrayProtoFindMethod.protoMethods = findsProto

  /**
   * @description 代理改变数组长度的方法
   * @param {{name: ChangeLensName}} [method = {}]
   * @returns {(...args: any[]) => any}
   * @--returns {ChangeLensType[ChangeLensName]}
   */
  function rewriteArrayStackMethod(method = {}) {
    const { name, protoImpl } = method
    const methodOrigin = protoImpl || Array.prototype[name]

    return function (...args) {
      const targetRawM = getTarget(this, true)[name]
      if (targetRawM !== methodOrigin) {
        // vue也是这样,如果有实例方法,则优先调用实例方法
        return Effect.applyWithoutEffect.apply(this, [targetRawM, ...args])
      }
      return Effect.applyWithoutEffect.apply(this, [methodOrigin, ...args])
    }
  }
  rewriteArrayStackMethod.arrayMethods = changeLens
  // rewriteArrayStackMethod.protoMethods = changeLensProto

  /**
   * @type {{
   * rewriteArrayProtoFindMethod: typeof rewriteArrayProtoFindMethod;
   * rewriteArrayStackMethod: typeof rewriteArrayStackMethod
   * }}
   */
  const rewriter = Object.create(null)
  Object.assign(rewriter, {
    rewriteArrayProtoFindMethod,
    rewriteArrayStackMethod
  })

  saveRecord(requiredOptions, rewriter, getRewriter)
  return rewriter
}

/**@typedef {ReturnType<getRewriter>} Rewriter */
/**@typedef {keyof Rewriter} RewriterKey */

/**@typedef {{
 * rewriteArrayProtoFindMethod: FindsType;
 * rewriteArrayStackMethod: ChangeLensType
 * }} RewriteMethod */

export { getRewriter }
