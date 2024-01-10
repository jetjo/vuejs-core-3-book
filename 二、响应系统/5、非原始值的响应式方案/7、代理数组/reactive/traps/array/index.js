import getFinds from './find.js'
import getStacks from './stack.js'
import { withRecordTrapOption } from '../../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'

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
