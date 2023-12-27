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
  function run(key, type) {
    const effects = depsMap?.get(key)
    if (effects && effects.size > 0) trigger.runEffects(effects, type)
  }

  // ReferenceError: Cannot access 'trigger' before initialization
  /**
   * @param {(import('./index.js').EffectFn)[]} effects
   * @param {import('./index.js').TriggerType} type 属性操作类型
   * */
  trigger.runEffects = function (effects, type) {
    warn('try scheduler job...')
    if (effects) {
      // 防止cleanup引发的无限循环,必须实例化一个effects的副本
      new Set(effects).forEach(ef => {
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
  function trigger(target, key, type) {
    depsMap = bucket.get(target)
    if (!depsMap) return

    const { findEffects, runEffects } = trigger
    if (findEffects && runEffects) {
      runEffects(findEffects(...arguments))
      return
    }

    run(key, type)
    if (type === TRIGGER_TYPE.ADD || type === TRIGGER_TYPE.DELETE) {
      run(ITERATE_KEY, type)
    }
    depsMap = undefined
  }

  return trigger
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
