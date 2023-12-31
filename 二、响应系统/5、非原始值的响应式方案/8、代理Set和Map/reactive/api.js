import * as trapsModule from './traps/index.js'
import {
  isReactive,
  PROTOTYPE_OF_BuildIn_SET__MAP
} from './traps/convention.js'
import {
  doWithAllTrapGetter,
  getProxyHandler,
  requireReactiveTarget
} from './traps/helper.js'
import {
  reactive,
  shallowReactive,
  readonly,
  shallowReadonly
} from '../../7、代理数组/reactive/api.js'
import {
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  throwErr,
  warn
} from '../../../4、响应系统的作用与实现/index.js'

/**@param {typeof reactive} api  */
function configApi(api) {
  function MakeProxySafe(target, proto) {
    const keys = []
    const descriptors = Object.getOwnPropertyDescriptors(proto)
    for (const key of Object.keys(descriptors)) {
      // for (const desc of descriptors) {
      // for (const key in proto) {
      // if (Object.hasOwnProperty.call(proto, key)) {
      // const protoMember = proto[key];
      // const key = desc.name
      // prettier-ignore
      if ((typeof key === 'symbol' && key !== Symbol.iterator) || key === 'constructor') continue
      const { get, set, value } = descriptors[key]
      const isValueProperty = get === undefined && set === undefined
      if (isValueProperty && typeof value !== 'function') continue
      if (!Object.hasOwn(target, key)) return false

      // if (isValueProperty) {
      //   // 不可行,target自身的key不一定是值属性
      //   // const ownEle = target[key]
      //   // const ownType = typeof ownEle
      //   // const ownElePrototype = ownEle?.prototype
      //   // if (!ownEle.name.startsWith('bound ')) return false
      //   // keys.push(key)
      //   // continue
      // }
      // const { get: ownGet, set: ownSet } = Object.getOwnPropertyDescriptor(target, key)
      // if (ownGet !== undefined && !ownGet.name.startsWith('bound ')) return false
      // if (ownSet !== undefined && !ownSet.name.startsWith('bound ')) return false
      // keys.push(key)
      // }
    }
    keys.forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(target, key)
      if (!descriptor.configurable) return
      // ???
      descriptor.configurable = false
      Object.defineProperty(target, key, descriptor)
    })
    return true
  }
  api.getProxyHandler = function (trapOption = {}, target) {
    if (target === undefined) throwErr('target不能是undefined!')
    const trapGetters = api.trapGetters
    const _getTrapOption = api.getTrapOption
    const reactiveInfo = api.reactiveInfo
    trapOption = _getTrapOption(trapOption)
    const traps = []
    trapGetters.forEach(getter => traps.push(getter(trapOption)))
    const handler = getProxyHandler(traps)
    function getProtoOfSetOrMap() {
      // if (Array.isArray(target)) return null
      // const proto = Object.getPrototypeOf(target)
      // if (proto === null || proto === Object.prototype) return null
      return (
        (target instanceof Set && Set.prototype) ||
        (target instanceof Map && Map.prototype) ||
        (target instanceof WeakSet && WeakSet.prototype) ||
        (target instanceof WeakMap && WeakMap.prototype) ||
        null
      )
    }
    // if (!actSetOrMap()) return handler
    const proto = getProtoOfSetOrMap()
    if (proto === null) return handler
    // if (!isSetOrMap(target)) return handler
    // if (MakeProxySafe(target, proto)) return handler
    reactiveInfo.get(target)[PROTOTYPE_OF_BuildIn_SET__MAP] = proto
    handler.get = handler.get?.trapForSetAndMap
    return handler
  }
}

const apis = [reactive, shallowReactive, readonly, shallowReadonly]

apis.forEach(configApi)

doWithAllTrapGetter(trapsModule, getter => {
  apis.forEach(api => {
    api.addTrapBeforeCall(getter)
  })
})

/**@param {typeof reactive} api  */
function wrapApi(isShallow = false, isReadonly = false) {
  const api = isShallow
    ? isReadonly
      ? shallowReadonly
      : shallowReactive
    : isReadonly
      ? readonly
      : reactive

  const reactiveMap = api.reactiveMap
  const isExpectedReactive = api.isExpectedReactive
  const reactiveInfo = api.reactiveInfo || new WeakMap()

  const __getApi = function (callFromSelfTrap = false) {
    return function (target) {
      if (!callFromSelfTrap) {
        requireReactiveTarget(target)
        if (isReactive(target) && isExpectedReactive(target, true))
          return target
      }
      if (reactiveMap.has(target)) return reactiveMap.get(target)
      reactiveInfo.set(target, Object.create(null))
      const py = new Proxy(target, __getApi.getProxyHandler({}, target))
      reactiveMap.set(target, py)
      return py
    }
  }

  Object.assign(__getApi, api)
  __getApi.reactiveInfo = reactiveInfo
  __getApi.setTrapOption({ reactiveInfo })
  if (!isShallow) {
    const opt = {
      reactive: !isReadonly ? __getApi(true) : undefined,
      readonly: isReadonly ? __getApi(true) : undefined
    }
    __getApi.setTrapOption(opt)
  }
  return __getApi
}

export { wrapApi as createReactive }
