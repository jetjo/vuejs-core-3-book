import { Effect } from '../effect/index.js'
import { isValidArrayIndex, log } from '@/utils/index.js'
import {
  ITERATE_KEY,
  TRIGGER_TYPE,
  ITERATE_KEY_VAL
} from './traps/convention.js'

/**@type {WeakMap<, Map<, Set<import('./index.js').EffectFn>>>} */
const bucket = new WeakMap()
/**@type {WeakMap<import('./index.js').EffectFn, Map<, Set<string>>>} */
const triggerBucket = new WeakMap()

/**getTrigger */
function getTrigger(option = {}) {
  /**@type {Map<, Set<import('./index.js').EffectFn>> | undefined} */
  let depsMap
  let effectsToRun = []

  function run(key, deps = undefined) {
    const effects = deps || depsMap?.get(key)
    if (!(effects?.size > 0)) return
    effects.forEach(ef => {
      // NOTE: 不能在这儿运行effect,因为所以关联的effect还没有找全,
      // 从这里就运行effect,无法避免重复执行
      // Effect.scheduler(ef)
      effectsToRun.push(ef)
    })
  }

  const handleArray = (() => {
    let newPropertyVal
    // 处理数组长度变小时的副作用
    const handleLengthSub = () => {
      const newLen = Number(newPropertyVal)
      depsMap?.forEach((deps, key) => {
        if (!isValidArrayIndex(key)) return
        const index = Number(key)
        if (index < newLen) return
        if (!(deps?.size > 0)) return
        run(key, deps)
      })
    }

    const arrayHandlers = new Map([
      [TRIGGER_TYPE.ADD, () => run('length')],
      [TRIGGER_TYPE.EmptySlotSet, () => run(ITERATE_KEY)],
      [
        TRIGGER_TYPE.LengthSubtract,
        () => {
          run(ITERATE_KEY)
          handleLengthSub()
        }
      ]
    ])

    return (triggerType, newVal) => {
      newPropertyVal = newVal
      // 从handlers中查找出handler,然后处理
      const handler = arrayHandlers.get(triggerType)
      log('5-7', 'triggerType', triggerType)
      if (handler) handler()
    }
  })()

  function trackEffect(key, target) {
    return
    const efs = Effect.trackTriggers({ triggerBucket })
    let efi = efs.next()
    while (!efi.done) {
      const triggerMap = triggerBucket.get(efi.value) || new WeakMap()
      if (!triggerMap.has(target)) triggerMap.set(target, new Set())
      const triggerSet = triggerMap.get(target)
      triggerSet.add(key)
      efi = efs.next({ triggerMap, triggerSet })
    }
  }

  /**
   * @param {any} key 属性名称
   * @param {import('./index.js').TriggerType} type 属性操作类型
   * */
  return function trigger(target, key, type, newVal, isArrayProperty) {
    depsMap = bucket.get(target)
    if (!depsMap || depsMap.size === 0) return

    if (type === TRIGGER_TYPE.CLEAR) {
      let effectsToRun = new Set()
      for (const deps of depsMap.values()) {
        deps.forEach(ef => {
          effectsToRun.add(ef)
        })
      }
      effectsToRun.forEach(ef => {
        Effect.scheduler(ef)
      })
      return
    }

    effectsToRun = []

    run(ITERATE_KEY_VAL)
    key != null && run(key)

    if (type === TRIGGER_TYPE.ADD || type === TRIGGER_TYPE.DELETE) {
      run(ITERATE_KEY)
    }

    if (isArrayProperty) handleArray(type, newVal)

    // withSceneStatus(true, function () {
    // NOTE: 防止cleanup引发的无限循环,必须实例化一个effects的副本
    // 并利用Set去重
    new Set(effectsToRun).forEach(ef => {
      Effect.scheduler(ef)
    })
    // })
  }
}

/**@typedef {ReturnType<getTrigger>} Trigger */

// function getTracker(option = {}) {
/**@param {string} key 属性名 */
function track(target, key) {
  if (!Effect.hasActive) return

  let depsMap = bucket.get(target)
  if (!depsMap) bucket.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))

  Effect.track({ deps })
}
// }

/**@typedef {typeof track} Track */

const trigger = getTrigger()

export { track, trigger, trigger as trriger }
