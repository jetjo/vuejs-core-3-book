import { Effect } from '../effect/index.js'
import { isValidArrayIndex, tryCall } from '../../index.js'
import { isHasTrap } from './traps/helper.js'
import { ITERATE_KEY, TRIGGER_TYPE } from './traps/convention.js'

/**@type {WeakMap<, Map<, Set<import('./index.js').EffectFn>>>} */
const bucket = new WeakMap()
/**@type {WeakMap<import('./index.js').EffectFn, Map<, Set<string>>>} */
const triggerBucket = new WeakMap()

/**getTrigger */
function getTrigger(options = {}) {
  /**@type {Map<, Set<import('./index.js').EffectFn>> | undefined} */
  let depsMap
  /**@type {import('./index.js').TriggerType} type 属性操作类型 */
  let triggerType
  let newPropertyVal
  let triggerTarget
  let triggerPropertyKey

  function run(key, deps) {
    const effects = deps || depsMap?.get(key)
    if (!(effects?.size > 0)) return
    runEffects(effects, key)
  }
  function tryRun(key, tr = false, deps = undefined) {
    if (tr) {
      tryCall(() => run(key, deps))
    }
    run(key, deps)
  }

  function handleLengthSub() {
    const bak = triggerType
    triggerType = TRIGGER_TYPE.DELETE
    tryCall(() => {
      const newLen = Number(newPropertyVal)
      depsMap?.forEach((deps, key) => {
        if (!isValidArrayIndex(key)) return
        const index = Number(key)
        if (index < newLen) return
        if (!(deps?.size > 0)) return
        run(key, deps)
      })
    })
    triggerType = bak
  }

  const arrayHandlers = new Map([
    [TRIGGER_TYPE.ADD, () => tryRun('length')],
    [
      TRIGGER_TYPE.EmptySlotSet,
      () => {
        const deps = depsMap?.get(ITERATE_KEY)
        if (deps && deps.size > 0) tryRun(ITERATE_KEY, false, deps)
      }
    ],
    [
      TRIGGER_TYPE.LengthSubtract,
      () => {
        const deps = depsMap?.get(ITERATE_KEY)
        if (deps && deps.size > 0) tryRun(ITERATE_KEY, false, deps)
        handleLengthSub()
      }
    ]
  ])

  function handleArray() {
    // 从handlers中查找出handler,然后处理
    const handler = arrayHandlers.get(triggerType)
    if (handler) handler()
  }

  function trackEffect(key) {
    const efs = Effect.trackTriggers({ triggerBucket })
    let { done: noEff, value: ef } = efs.next()
    while (!noEff) {
      const triggerMap = triggerBucket.get(ef) || new WeakMap()
      if (!triggerMap.has(triggerTarget))
        triggerMap.set(triggerTarget, new Set())
      const triggerSet = triggerMap.get(triggerTarget)
      triggerSet.add(key)
      ef = efs.next({ triggerMap, triggerSet })
    }
  }

  function canScheduler(ef, effects, key) {
    if (
      triggerType === TRIGGER_TYPE.SET &&
      ef.hasTrapDeps &&
      Effect.isOnlyFromHasTrap(ef, effects)
    )
      return false
    const triggerMap = triggerBucket.get(ef)
    if (!triggerMap) return true

    const triggerSet = triggerMap.get(triggerTarget)
    if (!triggerSet) return true

    if (!triggerSet.has(triggerPropertyKey) && !triggerSet.has(key)) {
      return true
    }

    return false

    // triggerBucket.delete(ef)
  }

  /** @param {(import('./index.js').EffectFn)[]} effects */
  function runEffects(effects, key) {
    trackEffect(key)
    // warn('try scheduler job...')
    // if (effects?.size === 0) return
    // 防止cleanup引发的无限循环,必须实例化一个effects的副本
    new Set(effects).forEach(ef => {
      if (canScheduler(ef, effects, key)) Effect.scheduler(ef)
    })
  }

  /** 抽象: 封装了一段代码的函数; 具体: 一段代码 */
  // function findEffects () {}

  /**
   * @param {string} key 属性名称
   * @param {import('./index.js').TriggerType} type 属性操作类型
   * */
  return function trigger(
    target,
    key,
    type,
    newVal,
    _isCommonArrayPropertySet
  ) {
    triggerTarget = target
    triggerPropertyKey = key
    // tryCall(() => {
    depsMap = bucket.get(target)
    if (!depsMap || depsMap.size === 0) return

    triggerType = type
    newPropertyVal = newVal
    const deps = depsMap.get(key)
    if (deps && deps.size > 0) tryRun(key, false, deps)

    if (type === TRIGGER_TYPE.ADD || type === TRIGGER_TYPE.DELETE) {
      const deps = depsMap.get(ITERATE_KEY)
      if (deps && deps.size > 0) tryRun(ITERATE_KEY, false, deps)
    }

    if (_isCommonArrayPropertySet) {
      handleArray()
    }
    // })
    // depsMap = undefined
    // triggerType = undefined
    // newPropertyVal = undefined
  }
}

/**@typedef {ReturnType<getTrigger>} Trigger */

// function getTracker(options = {}) {
/**@param {string} key 属性名 */
function track(target, key, trap) {
  if (!Effect.hasActive) return

  let depsMap = bucket.get(target)
  if (!depsMap) bucket.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))

  let isFromHasTrap
  if (typeof trap === 'function') {
    isFromHasTrap = isHasTrap(trap)
  }
  Effect.track({ deps, isFromHasTrap })
}
// }

/**@typedef {typeof track} Track */

const trigger = getTrigger()

export { track, trigger, trigger as trriger }
