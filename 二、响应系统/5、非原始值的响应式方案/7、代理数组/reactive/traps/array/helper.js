import { throwErr } from '../../../../index.js'
import { getTarget } from '../convention.js'

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

export { rewriteArrayProtoFindMethod }
