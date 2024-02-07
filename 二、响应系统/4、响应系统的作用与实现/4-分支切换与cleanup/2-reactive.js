/* 重新设计副作用集合的数据结构,将副作用的依赖精确的target的字段 */
import { activeEffect, effect } from './1-effect-fn-reg.js'

// 使用WeakMap的好处:
// 当一个target在用户(框架使用者,开发人员)代码中没有任何引用时,
// WeakMap对其的引用不影响垃圾回收(GC).
// 因为WeakMap对key是弱引用的,
// 这样避免了内存溢出.
const bucket = new WeakMap()

/* 对依赖的跟踪和触发逻辑的封装 */

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)

  // cleanup
  // 目前实现,会导致重复;
  // 比如副作用函数中多次访问同一对象的同一字段.
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  // cleanup
  // 副作用集合中的副作用执行时,
  // 会先将自身从集合中移除,
  // 但是副作用的执行导致的track依赖收集过程又会将自身重新追加到集合中,
  // 从而导致死循环.
  // 所以要new Set重新实例化一个副本
  const effects = new Set(depsMap.get(key))
  effects && effects.forEach(ef => ef())
}

function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      trigger(target, key)
      return true
    }
  })
}

export { reactive }
