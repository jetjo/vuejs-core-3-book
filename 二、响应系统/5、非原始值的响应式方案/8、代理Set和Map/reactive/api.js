/// <reference path="../../../../reactive.d.ts" />
import { trapGetters as defaultTrapGetters } from './traps/index.js'
import { isReactive, PROTOTYPE } from './traps/convention.js'
import { createProxyHandler, requireReactiveTarget, setReactiveApiFlag } from './traps/helper.js'
import { createReactive as baseCreateReactive } from '#reactive/5-7.js'
import { throwErr } from '#utils'
import getReactive from './traps/Reactive.js'
import { withRecordTrapOption } from '#reactive/traps/option.js'
import { proxyRefs } from '#ref-convention'

/**
 * @param {ReactiveApiCreator} api
 * @param {ReactiveApiCreator} baseApi
 * */
function configApi(api, baseApi) {
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
  const trapOption = api.trapOption
  const reactiveInfo = trapOption.reactiveInfo
  const trapGetters = api.trapGetters

  let proxyHandler, proxyHandlerForSetAndMap
  const res = {
    get default() {
      return proxyHandler
    },
    get setAndMap() {
      return proxyHandlerForSetAndMap
    },
    get isInitialized() {
      return proxyHandler !== undefined || proxyHandlerForSetAndMap !== undefined
    }
  }
  const _getProxyHandler = () => {
    Object.assign(trapOption, baseApi.getProxyHandler())
    const traps = []
    trapGetters.forEach(getter => traps.push(getter(trapOption)))
    return createProxyHandler(traps)
  }
  api.getProxyHandler = function (target) {
    if (target == undefined) throwErr('target不能是undefined!')
    const proto = getProtoOfSetOrMap(target)
    reactiveInfo.get(target)[PROTOTYPE] = proto
    const isSetOrMap = proto !== null
    trapOption.isSetOrMap = isSetOrMap

    if (!isSetOrMap) return proxyHandler || (proxyHandler = _getProxyHandler())

    return proxyHandlerForSetAndMap || (proxyHandlerForSetAndMap = _getProxyHandler())
  }
  return res
}

function factory({ isShallow, isReadonly, version }) {
  // TODO: 新增传递version参数, 未测试
  const baseApi = baseCreateReactive(isShallow, isReadonly) //, version)

  const baseApiOption = baseApi.trapOption
  const baseTrapGetters = baseApi.trapGetters
  const isExpectedReactive = baseApi.isExpectedReactive

  const reactiveMap = new WeakMap()
  const reactiveInfo = new WeakMap()

  let getProxyHandler
  function reactiveApi(callFromSelfTrap = false) {
    const api = function (target) {
      if (target == null) {
        throwErr('响应式状态的target不能是null或undefined!')
      }
      if (!callFromSelfTrap) {
        requireReactiveTarget(target)
        if (isReactive(target) && isExpectedReactive(target, true)) return target
      }
      target = proxyRefs(target)
      if (reactiveMap.has(target)) return reactiveMap.get(target)
      reactiveInfo.set(target, Object.create(null))
      const py = new Proxy(target, getProxyHandler(target))
      reactiveMap.set(target, py)
      return py
    }
    setReactiveApiFlag(api, { isShallow, isReadonly, version })
    return api
  }

  /**@type {Reactive} */
  let api
  /**@type {ReactiveApiCreator} */
  const getApi = () => {
    if (api !== undefined) return api
    baseApi()
    getProxyHandler = getApi.getProxyHandler
    return (api = reactiveApi())
  }

  const _trapOption = {
    ...baseApiOption,
    reactiveInfo,
    version,
    readonly: !isShallow && isReadonly ? reactiveApi(true) : undefined,
    reactive: !isShallow && !isReadonly ? reactiveApi(true) : undefined
  }
  let trapOption = { ..._trapOption, Reactive: getReactive(_trapOption) }
  let trapGetters = [...baseTrapGetters, ...defaultTrapGetters]

  Object.defineProperty(getApi, 'trapGetters', {
    get() {
      return [...trapGetters]
    },
    set(value) {
      if (proxyHandler.isInitialized) throwErr('配置异常!')
      if (!Array.isArray(value)) throwErr('参数必须是数组!')
      trapGetters = [...trapGetters, ...value]
    },
    enumerable: true
  })
  Object.defineProperty(getApi, 'trapOption', {
    get() {
      return { ...trapOption }
    },
    set(value) {
      if (proxyHandler.isInitialized) throwErr('配置异常!')
      trapOption = { ...trapOption, ...value }
    },
    enumerable: true
  })
  const proxyHandler = configApi(getApi, baseApi)
  return getApi
}

/**@type {CreateReactive} */
function createReactive(isShallow = false, isReadonly = false, version = '5-8') {
  return withRecordTrapOption({
    factory,
    isShallow,
    isReadonly,
    version,
    factoryName: 'createReactive'
  })
}

export { createReactive }
