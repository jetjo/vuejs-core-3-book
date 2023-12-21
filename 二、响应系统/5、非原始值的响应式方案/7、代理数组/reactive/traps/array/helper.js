import { throwErr } from '../../../../index.js'
import { getTarget } from '../convention.js'

function rewriteArrayProtoFindMethod(method = {}) {
  const { name, isInvalidRes } = method
  const methodOrigin = Array.prototype[name]
  if (!methodOrigin) throwErr(`${name} is not a array prototype function`)

  return function (...args) {
    const res = methodOrigin.apply(this, args)
    if (isInvalidRes(res)) {
      // throwErr(`can not ${name} with ${args}`)
      return methodOrigin.apply(getTarget(this, true), args)
    }
    return res
  }
}

export { rewriteArrayProtoFindMethod }
