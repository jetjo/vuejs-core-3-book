import { Effect } from '../effect/index.js'
import {
  isValidArrayIndex,
  tryCall,
  warn,
  log,
  error,
  throwErr
} from '../../index.js'
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

  const SceneProtectedFlag = Symbol('SceneProtectedFlag')

  function withSceneStatus(cb) {
    const bak = {
      __proto__: null,
      get [SceneProtectedFlag]() {
        return true
      },
      depsMap,
      triggerType,
      newPropertyVal,
      triggerTarget,
      triggerPropertyKey
    }
    try {
      return cb.apply(bak)
    } finally {
      depsMap = bak.depsMap
      triggerType = bak.triggerType
      newPropertyVal = bak.newPropertyVal
      triggerTarget = bak.triggerTarget
      triggerPropertyKey = bak.triggerPropertyKey
    }
  }

  function run(key, deps) {
    const effects = deps || depsMap?.get(key)
    if (!(effects?.size > 0)) return
    withSceneStatus(function () {
      runEffects.call(this, effects, key)
    })
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

  const opt = { triggerBucket }
  function trackEffect(key) {
    const efs = Effect.trackTriggers(opt)
    let efi = efs.next()
    while (!efi.done) {
      const triggerMap = triggerBucket.get(efi.value) || new WeakMap()
      if (!triggerMap.has(triggerTarget))
        triggerMap.set(triggerTarget, new Set())
      const triggerSet = triggerMap.get(triggerTarget)
      triggerSet.add(key)
      efi = efs.next({ triggerMap, triggerSet })
    }
  }

  function canScheduler(ef, effects, key) {
    if (
      triggerType === TRIGGER_TYPE.SET &&
      ef.hasTrapDeps &&
      Effect.isOnlyFromHasTrap(ef, effects)
    ) {
      warn('The trigger maybe from has trap, so skip scheduler job.')
      return false
    }
    // return true
    const triggerMap = triggerBucket.get(ef)
    if (!triggerMap) return true

    const triggerSet = triggerMap.get(triggerTarget)
    if (!triggerSet) return true

    if (!triggerSet.has(triggerPropertyKey) && !triggerSet.has(key)) {
      return true
    }

    warn(
      'You have a reactive effect that is mutating its own dependencies. Possible sources include component template, render function, updated hook or watcher source function.'
    )
    return false

    // triggerBucket.delete(ef)
  }

  /** @param {(import('./index.js').EffectFn)[]} effects */
  function runEffects(effects, key) {
    if (!this[SceneProtectedFlag]) {
      throwErr('runEffects must be called with `withSceneStatus`')
    }
    trackEffect(key)
    error(`try scheduler ${effects.size} job...`)
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
    const id = Math.random().toFixed(10).split('.')[1]
    log(
      `effect: ${Effect.latestActiveEffect?.__number_id}: trigger ${id} ${key} ${type.description} ${newVal}`
    )
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

    log(`effect: ${Effect.latestActiveEffect?.__number_id}: trigger ${id} done`)
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
