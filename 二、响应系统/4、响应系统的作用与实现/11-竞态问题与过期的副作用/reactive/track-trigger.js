import { Effect } from '../effect/index.js'
import { warn } from '../utils/log.js'
import { isHasTrap } from './traps/helper.js'
import { ITERATE_KEY, TRIGGER_TYPE } from './traps/convention.js'

/**@type {WeakMap<, Map<, Set<import('./index.js').EffectFn>>>} */
const bucket = new WeakMap()

/**getTrigger */
function getTrigger(options = {}) {
  /**@type {Map<, Set<import('./index.js').EffectFn>> | undefined} */
  let depsMap
  let effectsToRun = []
  function run(key) {
    const effects = depsMap?.get(key)
    if (effects && effects.size > 0) effectsToRun.push(...effects)
  }

  // ReferenceError: Cannot access 'trigger' before initialization
  /**
   * @param {(import('./index.js').EffectFn)[]} effects
   * @param {import('./index.js').TriggerType} type 属性操作类型
   * */
  function runEffects() {
    // warn('try scheduler job...')
    if (effectsToRun?.length > 0) {
      // 防止cleanup引发的无限循环,必须实例化一个effects的副本
      new Set(effectsToRun).forEach(ef => {
        Effect.scheduler(ef)
      })
    }
  }

  /* 具体: 一段代码 */
  /* 抽象: 封装了一段代码的函数 */
  function findEffects() {}

  // ReferenceError: Cannot access 'trigger' before initialization
  /* return  */
  /**
   * @param {string} key 属性名称
   * @param {import('./index.js').TriggerType} type 属性操作类型
   * */
  return function trigger(target, key, type) {
    depsMap = bucket.get(target)
    if (!depsMap) return

    effectsToRun = []
    run(key, type)
    if (type === TRIGGER_TYPE.ADD || type === TRIGGER_TYPE.DELETE) {
      run(ITERATE_KEY, type)
    }

    runEffects()
  }
}

/**@typedef {ReturnType<getTrigger>} Trigger */

// function getTracker(options = {}) {
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
