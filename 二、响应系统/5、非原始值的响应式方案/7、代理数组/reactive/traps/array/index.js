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

const lastCallRecord = {
  __proto__: null
  // rewriter,
  // arrayInstrumentations
}

/**
 * @returns {ChangeLensType & FindsType}
 */
function getArrayInstrumentations(options = {}) {
  // const { Effect } = options
  const rewriter = getRewriter(options)
  if (lastCallRecord.rewriter === rewriter)
    return lastCallRecord.arrayInstrumentations

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
  lastCallRecord.arrayInstrumentations = arrayInstrumentations

  return arrayInstrumentations
}

export { getArrayInstrumentations }
