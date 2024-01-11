import { PROTOTYPE_OF_SET__MAP } from './convention.js'
import getReactive from '../../../7、代理数组/reactive/traps/Reactive.js'
import { TRY_PROXY_NO_RESULT, ITERATE_KEY } from './convention.js'
import {
  log,
  throwErr,
  warn
} from '../../../../4、响应系统的作用与实现/index.js'
import getInstrumentations from './instrumentations.js'
import { withRecordTrapOption } from '../../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'

/**@type {ReactiveCtorFactory} */
function factory({
  isReadonly,
  ReactiveBase,
  setMapInstrumentations,
  reactiveInfo,
  track,
  Effect
}) {
  class Reactive extends ReactiveBase {
    constructor(...args) {
      super(...args)
    }
    static tryGet(target, key, receiver, isSetOrMap = false) {
      const flagRes = super.tryGetFlag(target, key, receiver)
      if (flagRes !== TRY_PROXY_NO_RESULT) return flagRes

      if (!isSetOrMap) return super.tryGet(target, key, receiver)

      if (key === 'prototype' || key === '__proto__') return target[key]
      if (key === 'constructor') {
        return this.getPropertyBindTo(target, key)
      }

      return this.tryGetForSetOrMap(target, key, receiver)

      // #region 死代码
      if (Object.hasOwn(target, key)) {
        // 不对, 如果原型上也有这个属性,那还可能引发异常
        // 读取自身属性
        // return TRY_PROXY_NO_RESULT
        // const res = Reflect.get(target, key, receiver)
        // if (Effect.hasActive) track(target, key)
        // if (typeof res === 'function') {
        //   // 假如函数中有对Set.prototype的方法的调用,又因this无法指向proxy,这种调用无法拦截!
        //   // const deCompile = Function.prototype.toString.call(res)
        // }
      }
      // 没法确定所访问的属性是否涉及到读取[[SetData]]或[[MapData]],
      // 假如涉及到,第三个参数不能是receiver,因为receiver就是proxy,proxy没有部署这些内部槽,
      // 会抛出异常
      // const preRes = Reflect.get(target, key, target)
      if (preRes === undefined && !(key in target)) {
        // 不存在的属性
        return TRY_PROXY_NO_RESULT
      }
      if (typeof preRes !== 'function') {
        if (key !== 'size') {
          // 属性值不是方法, 也不是size
          // `Set`和`Map·的原型上只有`size`属性,而`WeakSet`和`WeakMap`的原型上只有方法
          // 如果是`key`不是`size`,那么就不会直接读取到`[[SetData]]`或`[[MapData]]`
          return TRY_PROXY_NO_RESULT
        }
        return this.tryGetForSetOrMap(target, key, receiver, preRes)
      }
      // prettier-ignore
      if (targetProto == null) throwErr('targetProto不能是null!')
      if (targetProto[key] !== preRes) {
        // 虽然preRes方法不在targetProto上,但是如果targetProto上存在名为key的方法,
        // 那么在preRes方法内如果需要调用targetProto[key]方法,只能使用关键字super,
        // 这个时候如果上下文是receiver,仍然会引发异常, 因为super[key]()相当于super[key].call(receiver)
        // 所以直接返回不妥
        if (!Object.hasOwn(targetProto, key)) {
          // 读取的方法不是Set.prototype或Map.prototype上的方法
          // 要读取的方法不是`Set.prototype`或`Map.prototype`上的方法, 不需要代理
          return TRY_PROXY_NO_RESULT
        }
      }
      return this.tryGetForSetOrMap(target, key, receiver, preRes, targetProto)
      // #endregion
    }

    static getPropertyBindTo(target, key) {
      const res = Reflect.get(target, key, target)
      // NOTE: 防止: TypeError: Method get Set.prototype.size called on incompatible receiver
      // 例如如下Set的子类,当调用子类实例的mySize方法时,如果不bind,就会抛出异常

      class MySet extends Set {
        constructor() {
          super(...arguments)
        }

        mySize() {
          console.log(this, 'this')
          // 如果this是代理会抛出异常
          // NOTE: 相当于return Reflect.get(super, 'size', this)
          return super.size
        }
      }

      if (typeof res === 'function') return res.bind(target)
      return res
    }

    static tryGetForSetOrMap(target, key, receiver) {
      const proto = reactiveInfo.get(target)[PROTOTYPE_OF_SET__MAP]
      if (!Object.hasOwn(proto, key)) {
        // if (typeof key !== 'symbol') return TRY_PROXY_NO_RESULT
        // return target[key]
        return this.getPropertyBindTo(target, key)
      }

      if (key === 'size') {
        const res = Reflect.get(target, key, target)
        if (!isReadonly && Effect.hasActive) track(target, ITERATE_KEY)
        if (typeof res === 'function') return res.bind(target)
        return res
      }

      const protoProxy = setMapInstrumentations.get(proto)
      const res = protoProxy && protoProxy[key]
      if (typeof res !== 'function') {
        // throwErr('获取代理失败!', key)
        warn('获取代理失败!', key)
        return this.getPropertyBindTo(target, key)
      }
      return res

      // #region dead code
      const preRes = Reflect.get(target, key, target)
      // const res = preRes
      if (typeof res !== 'function') {
        // 读取size属性
        // `key`一定是`size`
        // NOTE: 如果是`key`是`size`,又不是`target`自身的属性,那情况就比较复杂
        // 有可能是读取的`Set.prototype.size`或`Map.prototype.size`,但是也不一定
        // 这里就暂未考虑,就当做是读取`Set.prototype.size`或`Map.prototype.size`吧
        if (Effect.hasActive) track(target, ITERATE_KEY)
        return res
      }
      // 读取的方法来自`Set.prototype`或`Map.prototype`,需要代理
      // const protoProxy = setMapInstrumentations.get(proto)
      if (protoProxy == null || protoProxy[key] == null)
        throwErr('此功能正在路上...', key)
      return protoProxy[key]
      // #endregion
    }
  }

  return Reactive
}

/**@param {ProxyTrapOption} option */
export default function (option) {
  const setMapInstrumentations = getInstrumentations(option)
  const ReactiveBase = getReactive(option)
  const { isShallow, isReadonly, reactiveInfo, track, Effect } = option
  const _option = {
    __proto__: null,
    track,
    Effect
  }
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version: option.version,
    factoryName: 'getReactive',
    ReactiveBase,
    setMapInstrumentations,
    reactiveInfo,
    track,
    Effect,
    option: isReadonly ? undefined : _option
  })
}
