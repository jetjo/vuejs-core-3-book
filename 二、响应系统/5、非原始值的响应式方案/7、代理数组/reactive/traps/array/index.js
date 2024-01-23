import getFinds from './find.js'
import getStacks from './stack.js'
import { withRecordTrapOption } from '#reactive/traps/option.js'

/**@type {ArrayProtoProxyFactory} */
function factory({ finds, stacks }) {
  // const findKeys = Object.keys(finds)
  // const stackKeys = Object.keys(stacks)
  const res = Object.assign(Object.create(null), finds, stacks)
  return res
}

/**@param {ProxyTrapOption} option */
export default function (option) {
  const finds = getFinds(option)
  const stacks = getStacks(option)
  return withRecordTrapOption({
    factory,
    isShallow: option.isShallow,
    isReadonly: option.isReadonly,
    version: option.version,
    factoryName: 'getArrayInstrumentations',
    finds,
    stacks
  })
}
