import { throwErr } from '../../../../index.js'
import finds from './find.js'
import changeLens from './changeStackLength.js'
import { ITERATE_KEY_VAL } from '../convention.js'

/**@typedef {import('./changeStackLength.js').ChangeLensType} ChangeLensType */
/**@typedef {import('./find.js').FindsType} FindsType */
/**@typedef {keyof FindsType} FindsName */
/**@typedef {keyof ChangeLensType} ChangeLensName */

const lastCallRecord = {
  __proto__: null
  // Effect,
  // getTarget,
  // track,
  // rewriter
}

/**@param {import('../../index.js').ProxyTrapOption} [options={}]  */
function getRewriter(options = {}) {
  const { Effect, getTarget, track } = options

  // debugger
  if (
    lastCallRecord.Effect === Effect &&
    lastCallRecord.getTarget === getTarget &&
    lastCallRecord.track === track
  )
    return lastCallRecord.rewriter

  Object.assign(lastCallRecord, { Effect, getTarget, track })

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

  lastCallRecord.rewriter = rewriter
  return rewriter
}

/**@typedef {ReturnType<getRewriter>} Rewriter */
/**@typedef {keyof Rewriter} RewriterKey */

/**@typedef {{
 * rewriteArrayProtoFindMethod: FindsType;
 * rewriteArrayStackMethod: ChangeLensType
 * }} RewriteMethod */

export { getRewriter }
