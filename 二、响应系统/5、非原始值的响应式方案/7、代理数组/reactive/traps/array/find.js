import { rewriteArrayProtoFindMethod } from './helper.js'

const arrayFindMethods = [
  {
    name: 'indexOf',
    isInvalidRes: res => res === -1,
    protoImpl: Array.prototype.indexOf
  },
  {
    name: 'lastIndexOf',
    isInvalidRes: res => res === -1,
    protoImpl: Array.prototype.lastIndexOf
  },
  {
    name: 'includes',
    isInvalidRes: res => res !== true,
    protoImpl: Array.prototype.includes
  }
]

const arrayInstrumentations = Object.create(null)

arrayFindMethods.reduce((instrumentations, method) => {
  instrumentations[method.name] = rewriteArrayProtoFindMethod(method)
  return instrumentations
}, arrayInstrumentations)

export { arrayInstrumentations }
