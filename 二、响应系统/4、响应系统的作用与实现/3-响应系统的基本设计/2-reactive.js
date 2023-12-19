/* 重新设计副作用集合的数据结构,将副作用的依赖精确的target的字段 */
import { activeEffect, effect } from './1-effect-fn-reg.js'

// 使用WeakMap的好处:
// 当一个target在用户(框架使用者,开发人员)代码中没有任何引用时,
// WeakMap对其的引用不影响垃圾回收(GC).
// 因为WeakMap对key是弱引用的,
// 这样避免了内存溢出.
const bucket = new WeakMap()

function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      /* if (!bucket.has(target)) {
        bucket.set(target, new Map())
      }
      const targetMap = bucket.get(target)
      if (!targetMap.has(key)) {
        targetMap.set(key, new Set())
      }
      const keySet = targetMap.get(key)
      activeEffect && keySet.add(activeEffect)
      return target[key] */
      if (!activeEffect) return target[key]
      let depsMap = bucket.get(target)
      if (!depsMap) {
        bucket.set(target, (depsMap = new Map()))
      }
      let deps = depsMap.get(key)
      if (!deps) {
        depsMap.set(key, (deps = new Set()))
      }
      deps.add(activeEffect)
      return target[key]
    },

    set(target, key, newVal) {
      target[key] = newVal
      const depsMap = bucket.get(target)
      if (!depsMap) return true
      const effects = depsMap.get(key)
      effects && effects.forEach(ef => ef())
      return true
    }
  })
}

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
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(ef => ef())
}

function reactive1(target) {
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

export { reactive1 as reactive }
