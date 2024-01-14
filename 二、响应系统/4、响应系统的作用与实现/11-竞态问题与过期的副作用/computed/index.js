import { effect, Effect } from '../effect/index.js'
import { track, trigger } from '../reactive/track-trigger.js'

/**
 * - 用于对一个依赖于响应式数据的函数(getter,一般是纯函数)的结果进行缓存,
 * - 并返回一个响应式obj,
 * - 这个obj缓存getter的结果,
 * - 并进一步收集依赖于这个obj的副作用,
 * - 以便在getter的依赖更改时,
 * - 进一步触发依赖于此obj(缓存getter的结果)的其他副作用
 * @param {()=>any} getter
 * @returns 缓存了getter结果的响应式数据
 */
function computed(getter) {
  let val,
    dirty = true
  const eFn = effect(getter, {
    lazy: true,
    queueJob: true,
    scheduler() {
      dirty = true
      trigger(obj, 'value')
    }
  })
  const obj = {
    get value() {
      if (Effect.hasActive) track(obj, 'value', getTrap)
      if (!dirty) return val
      val = eFn()
      dirty = false
      return val
    }
  }
  const getTrap = Object.getOwnPropertyDescriptor(obj, 'value').get
  return obj
}

export { computed }
