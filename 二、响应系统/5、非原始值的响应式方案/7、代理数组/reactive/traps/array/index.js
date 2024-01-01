import { log } from '../../../../../4、响应系统的作用与实现/index.js'
import {
  getLastCallRecord,
  requireRegularOption,
  saveRecord
} from '../../../../6、浅只读与深只读/reactive/traps/options/helper.js'
import { getRewriter } from './helper.js'

/**@typedef {import('./changeStackLength.js').ChangeLensType} ChangeLensType */
/**@typedef {import('./find.js').FindsType} FindsType */
/**@typedef {import('./helper.js').Rewriter} Rewriter */
/**@typedef {import('./helper.js').RewriterKey} RewriterKey */
/**@typedef {import('./helper.js').RewriteMethod} RewriteMethod */
/**
 *
 * @param {Object} [options = {}]
 * @param {Rewriter[RewriterKey]} [options.rewrite]
 * @param {Rewriter[RewriterKey]['arrayMethods']} [options.arrayMethods]
 * @returns {RewriteMethod[RewriterKey]}
 */
function _getArrayInstrumentations(options = {}) {
  const { rewrite, arrayMethods } = options
  const arrayInstrumentations = Object.create(null)

  arrayMethods.reduce((instrumentations, method) => {
    instrumentations[method.name] = rewrite(method)
    return instrumentations
  }, arrayInstrumentations)

  return arrayInstrumentations
}

/**
 * @returns {ChangeLensType & FindsType}
 */
function getArrayInstrumentations(options = {}) {
  const rewriter = getRewriter(options)
  const _options = { __proto__: null, rewriter, ...options }
  const { lastCallRecord, isSameCall } = getLastCallRecord(
    _options,
    getArrayInstrumentations
  )
  // log(lastCallRecord.type, isSameCall, 'getArrayInstrumentations')
  if (isSameCall) return lastCallRecord.result
  const { isShallow, isReadonly, reactiveApi } = requireRegularOption(_options)
  const requiredOptions = {
    __proto__: null,
    isShallow,
    isReadonly,
    reactiveApi,
    rewriter
  }

  lastCallRecord.rewriter = rewriter

  const arrayInstrumentations = Object.create(null)
  for (const rewrite of Object.values(rewriter)) {
    if (!rewrite.arrayMethods) continue
    const methods = _getArrayInstrumentations({
      rewrite,
      arrayMethods: rewrite.arrayMethods
    })
    Object.assign(arrayInstrumentations, methods)
  }
  saveRecord(requiredOptions, arrayInstrumentations, getArrayInstrumentations)

  return arrayInstrumentations
}

export { getArrayInstrumentations }
