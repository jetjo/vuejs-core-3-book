/* 对依赖收集和响应触发逻辑的封装 */
/* 实现分支切换前的cleanup */
/* 避免无限递归循环 */
/* 支持调度执行 */
/* 约定reactive类型的判断方案 */
/* 支持收集依赖于对象成员遍历的副作用 */
import { activeEffect } from '../../8-计算属性与lazy/1-effect-fn-reg.js'
import { scheduler } from '../../8-计算属性与lazy/3-scheduler.js'

let bucket = new WeakMap()

const ITERATE_KEY = Symbol('用于收集依赖于对象成员遍历的副作用的约定字段名')

const TRIGGER_TYPE = {
  ADD: Symbol('TRIGGER_TYPE.ADD'),
  SET: Symbol('TRIGGER_TYPE.SET'),
  DELETE: Symbol('TRIGGER_TYPE.DELETE')
}

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

function trriger(target, key, newVal, type) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  // 不能返回,当type为add或delete时,还需要进一步操作
  // if (!effects) return

  /*   let effectsToRun = new Set(effects)
  if (activeEffect) {
    effectsToRun = [...effectsToRun].filter(ef => ef !== activeEffect)
  } */
  const effectsToRun = new Set(effects)
  if (type === TRIGGER_TYPE.ADD || type === TRIGGER_TYPE.DELETE) {
    const iterateEffects = depsMap.get(ITERATE_KEY)
    if (iterateEffects) {
      // effectsToRun.add(iterateEffects)
      iterateEffects.forEach(ef => {
        effectsToRun.add(ef)
      })
    }
  }
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
  const o = new Proxy(target, {
    get(target, key, receiver) {
      activeEffect && track(target, key)
      // return target[key]
      return Reflect.get(target, key, receiver)
    },
    set(target, key, newVal) {
      target[key] = newVal
      trriger(target, key)
      return true
    }
  })

  // 通过其判断是否为reactive
  // NOTE: 这样其实是在target上定义了`__is_reactive属性`,
  // 无意中修改了target;
  // 并且被o的set trap 拦截到,
  // 触发了不必要的trriger调用.
  // 不妥.
  // o.__is_reactive = true;
  return o
}

export {
  reactive,
  bucket,
  track,
  trriger,
  trriger as trigger,
  ITERATE_KEY,
  TRIGGER_TYPE
}
