import { rewriteArrayProtoFindMethod } from './helper.js'

const arrayFindMethods = [
  {
    name: 'indexOf',
    isInvalidRes: res => res === -1
  },
  {
    name: 'lastIndexOf',
    isInvalidRes: res => res === -1
  },
  {
    name: 'includes',
    isInvalidRes: res => res !== true
  }
]

const arrayInstrumentations = Object.create(null)

arrayFindMethods.reduce((instrumentations, method) => {
  instrumentations[method.name] = rewriteArrayProtoFindMethod(method)
  return instrumentations
}, arrayInstrumentations)

export { arrayInstrumentations }
