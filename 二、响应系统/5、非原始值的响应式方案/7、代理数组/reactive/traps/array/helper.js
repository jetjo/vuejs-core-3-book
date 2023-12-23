import { throwErr } from '../../../../index.js'
import finds from './find.js'
import changeLens from './changeStackLength.js'

/**@typedef {import('./changeStackLength.js').ChangeLensType} ChangeLensType */
/**@typedef {import('./find.js').FindsType} FindsType */
/**@typedef {keyof FindsType} FindsName */
/**@typedef {keyof ChangeLensType} ChangeLensName */

/**@param {import('../../index.js').ProxyTrapOption} [options={}]  */
function getRewriter(options = {}) {
  const { Effect, getTarget } = options

  /**
   * @param {{name: FindsName}} [method = {}]
   * @returns {(...args: any[]) => any}
   * @--returns {FindsType[FindsName]}
   */
  function rewriteArrayProtoFindMethod(method = {}) {
    const { name, isInvalidRes, protoImpl } = method
    const methodOrigin = protoImpl || Array.prototype[name]
    if (!methodOrigin) throwErr(`${name} is not a array prototype function`)

    return function (...args) {
      const targetRaw = getTarget(this, true)
      if (
        Object.prototype.hasOwnProperty.call(targetRaw, name) &&
        targetRaw[name] !== methodOrigin
      ) {
        throwErr(
          `can not ${name} with ${args}; 不允许数组实例覆盖其原型链上的${name}方法!!!`
        )
      }
      const res = methodOrigin.apply(this, args)
      if (isInvalidRes(res)) {
        // throwErr(`can not ${name} with ${args}`)
        return methodOrigin.apply(targetRaw, args)
      }
      return res
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
  return rewriter
}

/**@typedef {ReturnType<getRewriter>} Rewriter */
/**@typedef {keyof Rewriter} RewriterKey */

/**@typedef {{
 * rewriteArrayProtoFindMethod: FindsType;
 * rewriteArrayStackMethod: ChangeLensType
 * }} RewriteMethod */

export { getRewriter }
