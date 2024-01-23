import { withRecordTrapOption } from '#reactive/traps/option.js'
import { warn } from '#utils'
import { RAW, getRaw } from '../convention.js'
import { withAllPropertyEnumerable } from './helper.js'

const proto = {
  __proto__: null,
  push: Array.prototype.push,
  pop: Array.prototype.pop,
  shift: Array.prototype.shift,
  unshift: Array.prototype.unshift,
  splice: Array.prototype.splice
}

/**@type {ArrayProtoProxyFactory} */
function factory({ isReadonly, applyWithoutEffect }) {
  class ArrayProxy extends Array {
    constructor(...args) {
      super(...args)
    }
    getRawItems(...items) {
      return items
      // NOTE: 防止污染原始数据,但vue只对Set、Map、WeakSet、WeakMap实施了此策略
      return items.map(item => getRaw(item))
    }
    push(...args) {
      if (isReadonly) {
        warn('数组是只读的,不能执行push操作')
        return this[RAW].length
      }
      const _args = this.getRawItems(...args)
      _args.unshift(this[RAW].push)
      const res = applyWithoutEffect.apply(this, _args)
      // trigger(this[RAW], 'length', TRIGGER_TYPE.SET, this[RAW].length, true)
      return res
    }
    pop(...args) {
      if (isReadonly) {
        warn('数组是只读的,不能执行pop操作')
        return undefined
      }
      args.unshift(this[RAW].pop)
      return applyWithoutEffect.apply(this, args)
    }
    shift(...args) {
      if (isReadonly) {
        warn('数组是只读的,不能执行shift操作')
        return undefined
      }
      args.unshift(this[RAW].shift)
      return applyWithoutEffect.apply(this, args)
    }
    unshift(...args) {
      if (isReadonly) {
        warn('数组是只读的,不能执行unshift操作')
        return this[RAW].length
      }
      const _args = this.getRawItems(...args)
      _args.unshift(this[RAW].unshift)
      return applyWithoutEffect.apply(this, _args)
    }
    splice(...args) {
      if (isReadonly) {
        warn('数组是只读的,不能执行splice操作')
        return []
      }
      const [start, deleteCount, ...itemsToAdd] = args
      const _itemsToAdd = this.getRawItems(...itemsToAdd)
      const _args = [start, deleteCount, ..._itemsToAdd]
      _args.unshift(this[RAW].splice)
      return applyWithoutEffect.apply(this, _args)
    }
  }
  delete ArrayProxy.prototype.constructor
  return withAllPropertyEnumerable(ArrayProxy.prototype)
}

/**@param {ProxyTrapOption} */
export default function ({
  Effect: { applyWithoutEffect },
  isReadonly,
  isShallow,
  version
}) {
  return withRecordTrapOption({
    factory,
    isReadonly,
    isShallow,
    version,
    applyWithoutEffect,
    factoryName: 'getArrayStackProxy'
  })
}
