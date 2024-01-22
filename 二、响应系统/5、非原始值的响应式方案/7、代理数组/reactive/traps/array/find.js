import { withRecordTrapOption } from '@/reactive/_traps/option.js'
import { ITERATE_KEY_VAL, RAW, getRaw } from '../convention.js'
import { withAllPropertyEnumerable } from './helper.js'

const proto = {
  indexOf: Array.prototype.indexOf,
  lastIndexOf: Array.prototype.lastIndexOf,
  includes: Array.prototype.includes
}

/**@type {ArrayProtoProxyFactory} */
function factory({ isReadonly, track, Effect }) {
  class ArrayProxy extends Array {
    constructor(...args) {
      super(...args)
    }
    // static
    isFindMethod(key) {
      return key === 'indexOf' || key === 'lastIndexOf' || key === 'includes'
    }
    getSearchRaw(searchElement) {
      // // 经测试,vue也是这样收集依赖的
      // // 比如在调用includes方法时,可能要搜索的元素出现在索引i处,
      // // 那么查询是从includes方法第二个参数指定的起始索引处开始依次对比,
      // // 直到索引i处为止,因为在索引i处找到了要搜索的元素,
      // // 所以方法执行完毕;
      // // 因此小于起始索引和大于i索引的元素都没有被读取到,
      // // 所以当这些没有被读取到的元素值变化时并不能影响includes的执行结果,
      // // (即includes方法不依赖于这些元素.)
      // // 按理不必重新执行includes方法,但是vue却仍重新执行了includes方法,不知为何...
      // 逻辑转移到Reactive.tryGet中
      // if (!isReadonly && Effect.hasActive) {
      //   track(this[RAW], ITERATE_KEY_VAL)
      // }
      // 根据避免污染原始数据的原则,原始数组中不应该出现reactive类型,
      // 所以如果要搜索的元素是reactive类型,应该先取出原始值
      return getRaw(searchElement)
    }
    trackFind() {
      if (!isReadonly && Effect.hasActive) {
        track(this[RAW], ITERATE_KEY_VAL)
      }
    }
    indexOf(searchElement, fromIndex = 0) {
      this.trackFind()
      return this[RAW].indexOf(getRaw(searchElement), fromIndex)
    }
    lastIndexOf(searchElement, fromIndex = 0) {
      this.trackFind()
      return this[RAW].lastIndexOf(getRaw(searchElement), fromIndex)
    }
    includes(...args) {
      // NOTE: vue并没有对参数做任何更改
      // includes(searchElement, fromIndex = 0) {
      this.trackFind()
      // NOTE: vue并没有对参数做任何更改
      // return this[RAW].includes(getRaw(searchElement), fromIndex)
      const target = this[RAW]
      const originMethod = target.includes
      const res = originMethod.apply(this, args)
      if (res) return res
      return originMethod.apply(target, args)
      // return super.includes.call(this[RAW], getRaw(args[0]), args[1])
      // 相当于super.includes.apply(this, args)
      // const res = super.includes(...args)
      if (res) return res
      return super.includes.apply(this[RAW], args)
    }
  }
  delete ArrayProxy.prototype.constructor
  return withAllPropertyEnumerable(ArrayProxy.prototype)
}

/**@param {ProxyTrapOption}  */
export default function ({ version, isShallow, isReadonly, Effect, track }) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'getArrayFindProxy',
    option: isReadonly ? undefined : { __proto__: null, track, Effect }
  })
}
