import { trapGetters } from './traps/index.js'
import { isReactive, PROTOTYPE_OF_SET__MAP } from './traps/convention.js'
import { createProxyHandler, requireReactiveTarget } from './traps/helper.js'
import { createReactive as baseCreateReactive } from '../../7、代理数组/reactive/api.js'
import { throwErr } from '../../../4、响应系统的作用与实现/index.js'
import getReactive from './traps/Reactive.js'
import { withRecordTrapOption } from '../../../4、响应系统的作用与实现/11-竞态问题与过期的副作用/reactive/traps/option.js'

/**@param {typeof reactive} api  */
function configApi(api) {
  const getProtoOfSetOrMap = target => {
    if (Array.isArray(target)) return null
    const proto = Object.getPrototypeOf(target)
    if (proto === null || proto === Object.prototype) return null
    return (
      (target instanceof Set && Set.prototype) ||
      (target instanceof Map && Map.prototype) ||
      (target instanceof WeakSet && WeakSet.prototype) ||
      (target instanceof WeakMap && WeakMap.prototype) ||
      null
    )
  }
  api.getProxyHandler = function (target) {
    if (target === undefined) throwErr('target不能是undefined!')
    const trapGetters = api.trapGetters
    const trapOption = api.trapOption
    const reactiveInfo = trapOption.reactiveInfo
    const traps = []
    trapGetters.forEach(getter => traps.push(getter(trapOption)))
    const handler = createProxyHandler(traps)
    const proto = getProtoOfSetOrMap(target)
    if (proto === null) return handler
    reactiveInfo.get(target)[PROTOTYPE_OF_SET__MAP] = proto
    handler.get = handler.get?.trapForSetAndMap
    return handler
  }
}

function factory({ isShallow, isReadonly, version }) {
  const baseApi = baseCreateReactive(isShallow, isReadonly, version)

  baseApi.trapGetters = trapGetters

  const reactiveMap = new WeakMap()
  const reactiveInfo = new WeakMap()
  const isExpectedReactive = baseApi.isExpectedReactive

  let getProxyHandler
  function reactiveApi(callFromSelfTrap = false) {
    return function (target) {
      if (!callFromSelfTrap) {
        requireReactiveTarget(target)
        if (isReactive(target) && isExpectedReactive(target, true))
          return target
      }
      if (reactiveMap.has(target)) return reactiveMap.get(target)
      reactiveInfo.set(target, Object.create(null))
      const py = new Proxy(target, getProxyHandler(target))
      reactiveMap.set(target, py)
      return py
    }
  }

  /**@type {Reactive} */
  let api
  /**@type {ReactiveApiCreator} */
  const getApi = () => {
    if (api !== undefined) return api
    getProxyHandler = getApi.getProxyHandler
    delete getApi.getProxyHandler
    return (api = reactiveApi())
  }

  Object.assign(getApi, baseApi)

  const trapOption = { ...getApi.trapOption, reactiveInfo, version }
  if (!isShallow) {
    trapOption[isReadonly ? 'readonly' : 'reactive'] = reactiveApi(true)
  }
  trapOption.Reactive = getReactive(trapOption)
  getApi.trapOption = trapOption

  configApi(getApi)
  return getApi
}

/**@type {CreateReactive} */
function createReactive(
  isShallow = false,
  isReadonly = false,
  version = '5-8'
) {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'createReactive'
  })
}

export { createReactive }
