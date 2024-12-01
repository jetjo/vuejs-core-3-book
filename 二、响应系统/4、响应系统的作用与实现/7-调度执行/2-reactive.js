/* 对依赖收集和响应触发逻辑的封装 */
/* 实现分支切换前的cleanup */
/* 避免无限递归循环 */
/* 支持调度执行 */
import { activeEffect } from './1-effect-fn-reg.js'
import { scheduler } from './3-scheduler.js'

let bucket = new WeakMap()

function track(target, key)
{
  // const access = () => target[key];
  // if (!activeEffect) return access();
  let depsMap = bucket.get(target)
  if (!depsMap)
  {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps)
  {
    depsMap.set(key, (deps = new Set(),
      deps.invoker = () => command(deps),
      deps.shouldRun = () => shouldRun(deps, target, key),
      deps.shouldIs = () => deps.newVal,
      deps.newVal = target[key]
      , deps))
  }
  const access = () => deps.shouldIs()
  if (!activeEffect) return access()
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
  return access()
}

const shouldRun = (deps, target, key) =>
{
  const res = deps.initVal !== deps.newVal
  if (res)
  {
    deps.initVal = undefined
    target[key] = deps.newVal
  }
  return res
}

const command = (effects) =>
{
  if (!effects.shouldRun()) return
  const effectsToRun = new Set(effects)
  effectsToRun.forEach(ef =>
  {
    if (ef === activeEffect) return
    if (ef.options.scheduler)
    {
      // 控制权交回给用户
      // if (ef.options.queueJob) {
      scheduler(ef.options.scheduler)
      // } else {
      //   ef.options.scheduler(ef)
      // }
    } else
    {
      ef()
    }
  })
}

function trriger(target, key, newVal)
{
  const assign = () => target[key] = newVal
  const depsMap = bucket.get(target)
  if (!depsMap) return assign()
  const effects = depsMap.get(key)
  if (!effects) return assign()
  if ((effects.shouldIs ? effects.shouldIs() : target[key]) === newVal) return
  effects.initVal ||= target[key]
  effects.newVal = newVal
  /*   let effectsToRun = new Set(effects)
  if (activeEffect) {
    effectsToRun = [...effectsToRun].filter(ef => ef !== activeEffect)
  } */
  scheduler(effects.invoker)
}

function reactive(target)
{
  return new Proxy(target, {
    get(target, key)
    {
      return track(target, key)
      // return target[key];
    },
    set(target, key, newVal)
    {
      // if (target[key] === newVal) return true; 该交由trigger判断
      // target[key] = newVal;
      trriger(target, key, newVal)
      return true
    }
  })
}

export { reactive }
