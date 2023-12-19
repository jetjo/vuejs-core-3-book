import { Effect } from '../effect/index.js'
import { isValidArrayIndex, tryCall } from '../../index.js'
import { isHasTrap } from './traps/helper.js'
import { ITERATE_KEY, TRIGGER_TYPE } from './traps/convention.js'

/**@type {WeakMap<, Map<, Set<import('./index.js').EffectFn>>>} */
const bucket = new WeakMap()

/**getTrigger */
function getTrigger(options = {}) {
  /**@type {Map<, Set<import('./index.js').EffectFn>> | undefined} */
  let depsMap
  /**@type {import('./index.js').TriggerType} type 属性操作类型 */
  let triggerType
  let newPropertyVal

  function run(key, deps) {
    const effects = deps || depsMap?.get(key)
    if (!(effects?.size > 0)) return
    runEffects(effects)
  }
  function tryRun(key, tr = false) {
    if (tr) {
      tryCall(() => run(key))
    }
    run(key)
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
    [TRIGGER_TYPE.EmptySlotSet, () => tryRun(ITERATE_KEY)],
    [
      TRIGGER_TYPE.LengthSubtract,
      () => {
        tryRun(ITERATE_KEY)
        handleLengthSub()
      }
    ]
  ])

  function handleArray() {
    // 从handlers中查找出handler,然后处理
    const handler = arrayHandlers.get(triggerType)
    if (handler) handler()
  }

  /** @param {(import('./index.js').EffectFn)[]} effects */
  function runEffects(effects) {
    // warn('try scheduler job...')
    // if (effects?.size === 0) return
    // 防止cleanup引发的无限循环,必须实例化一个effects的副本
    new Set(effects).forEach(ef => {
      if (
        triggerType === TRIGGER_TYPE.SET &&
        ef.hasTrapDeps &&
        Effect.isOnlyFromHasTrap(ef, effects)
      )
        return
      return Effect.scheduler(ef)
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
    // tryCall(() => {
    depsMap = bucket.get(target)
    if (!depsMap) return

    triggerType = type
    newPropertyVal = newVal
    tryRun(key)

    if (type === TRIGGER_TYPE.ADD || type === TRIGGER_TYPE.DELETE) {
      tryRun(ITERATE_KEY)
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
