import { notNaN } from '../../../utils/index.js'
import { RAW } from './traps/convention.js'

const canTrigger = (oldVal, valAfterSet, target, receiver) => {
  return (
    // 考虑到有代理的情况下赋值结果suc并不可靠. 比如target是readonly时
    // oldVal !== newVal &&
    // (notNaN(oldVal) || notNaN(newVal)) &&
    oldVal !== valAfterSet &&
    (notNaN(oldVal) || notNaN(valAfterSet)) &&
    receiver[RAW] === target
  )
}

export { canTrigger }
