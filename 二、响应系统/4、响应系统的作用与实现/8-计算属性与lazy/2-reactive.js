/* 对依赖收集和响应触发逻辑的封装 */
/* 实现分支切换前的cleanup */
/* 避免无限递归循环 */
/* 支持调度执行 */
import { activeEffect } from './1-effect-fn-reg.js'
import { scheduler } from './3-scheduler.js'

let bucket = new WeakMap()

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
  activeEffect.deps.push(deps)
}

function trriger(target, key, newVal) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  if (!effects) return

  /*   let effectsToRun = new Set(effects)
  if (activeEffect) {
    effectsToRun = [...effectsToRun].filter(ef => ef !== activeEffect)
  } */
  const effectsToRun = new Set(effects)
  effectsToRun.forEach(ef => {
    if (ef === activeEffect) return
    if (ef.options.scheduler) {
      // 控制权交回给用户
      if (ef.options.queueJob) {
        scheduler(ef.options.scheduler)
      } else {
        ef.options.scheduler(ef)
      }
    } else {
      ef()
    }
  })
}

function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      trriger(target, key)
      return true
    }
  })
}

export { reactive, bucket, track, trriger, trriger as trigger }
