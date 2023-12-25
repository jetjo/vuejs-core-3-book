/* @4-4 分支与cleanup */
/* @4-5 effect嵌套与effect栈 */
/* @4-6 避免effect递归死循环 */
/* @4-7 副作用的调度执行 */

import { throwErr, warn } from '../utils/log.js'
import { FN_EFFECT_MAP_KEY } from './convention.js'
import { scheduler, isFlushingQueue } from './scheduler.js'

/**@template T */
/**@callback CB */
/**@type {EFn} */
let activeEffect
/**@type {EFn[]} */
const effectStack = []

function Effect() {
  if (new.target) return effect
}

// NOTE: class模式下是只读的???
Effect.prototype = null
Object.setPrototypeOf(Effect, null)
// console.log(Effect())
// console.log(new Effect())

/**@typedef {typeof Effect} EffectM */

/**
 * 收集副作用的依赖项
 * @param {Object} args
 * @param {!Set<EFn>} args.deps
 * */
Effect.track = function ({ deps, isFromHasTrap }) {
  if (!activeEffect) throwErr('activeEffect不应该是空!')
  deps.add(activeEffect)
  if (isFromHasTrap) {
    if (typeof activeEffect.hasTrapDeps === 'undefined')
      activeEffect.hasTrapDeps = []
    activeEffect.hasTrapDeps.push(deps)
    return
  }
  activeEffect.deps.push(deps)
}

/**
 * @param {Object} args
 * @param {WeakMap<EFn, WeakMap<, Set<string>>>} args.triggerBucket */
Effect.trackTriggers = function* ({ triggerBucket }) {
  const afs = effectStack.filter(ef => ef !== undefined)
  for (const ef of afs) {
    /**
     * @type {{
     * triggerMap: WeakMap<, Set<string>>
     * triggerSet: Set<string>}}
     */
    const { triggerMap, triggerSet } = yield ef
    triggerBucket.set(ef, triggerMap)
    afs.forEach(ef => {
      ef.triggers.add(triggerSet)
    })
    // return 0
  }
}

Object.defineProperty(Effect, 'hasActive', {
  get() {
    return !!activeEffect
  }
})
Object.defineProperty(Effect, 'activeEffects', {
  get() {
    return effectStack.filter(ef => ef !== undefined)
  }
})

/**
 * @param {EFn} efn
 * @param {!Set<EFn>} deps
 */
Effect.isOnlyFromHasTrap = function (efn, deps) {
  return (
    deps?.size > 0 &&
    efn.hasTrapDeps?.length > 0 &&
    !efn.deps.includes(deps) &&
    efn.hasTrapDeps.includes(deps)
  )
}

/**@param {EFn} efn */
Effect.scheduler = function (efn, cb) {
  if (efn === activeEffect || effectStack.includes(efn)) return
  const { scheduler: run, mustSynCallPre } = efn.options
  mustSynCallPre && mustSynCallPre()
  if (run) scheduler(run)
  else {
    warn('run sync job')
    efn(efn)
  }
  cb && cb()
}

/**
 * 副作用函数
 * @typedef EFnConf
 * @property {!(!Set<EFn>)[]} deps - 包含此EFn的集合们, 没有去重
 * @property {(!Set<EFn>)[]} [hasTrapDeps] - 当这个副作用只依赖于相应的属性的有无时, 包含此副作用的集合会存入这里, 没有去重
 * @property {!Set<!Set<string>>} triggers - 包含此EFn修改过的属性的集合
 * @property {function(): void} popSelfOutFromEffectStack
 * @typedef EFnOptions
 * @property {boolean} [lazy]
 * @property {boolean} [queueJob = true]
 * @property {(e: EFn) => void | () => void} [scheduler]
 * @property {() => void} [mustSynCallPre]
 * @typedef {EFnConf & {options: EFnOptions} & CB} EFn
 * */

/**@param {!EFn} eFn */
function cleanup(eFn) {
  // 外部依赖她, 需要判断
  if (!eFn || !eFn[FN_EFFECT_MAP_KEY]) return
  eFn.deps.forEach(s => s.delete(eFn))
  eFn.deps.length = 0
  if (typeof eFn.hasTrapDeps !== 'undefined') {
    eFn.hasTrapDeps.forEach(s => s.delete(eFn))
    eFn.hasTrapDeps.length = 0
  }
  eFn.triggers.forEach(s => s.clear())
  eFn.triggers.clear()
}
// 外部依赖她
Effect.cleanup = cleanup

Effect.runWithoutEffect = function (cb) {
  /* const bk = activeEffect
  activeEffect = undefined
  try {
    cb()
  } finally {
    activeEffect = bk
  } */
  return runEffect(cb, false)
}

Effect.applyWithoutEffect = function (cb, ...args) {
  return applyEffect(cb, false, this, ...args)
}

function prepareEffect(fn, enableEffect = true) {
  /**@type {EFn|undefined} */
  const eFn = enableEffect ? fn[FN_EFFECT_MAP_KEY] : undefined
  eFn && cleanup(eFn)
  activeEffect = eFn
  effectStack.push(eFn)
  return eFn
}

function runEffect(fn, enableEffect) {
  return applyEffect(fn, enableEffect, undefined)
}

function applyEffect(fn, enableEffect, thisArg, ...args) {
  const eFn = prepareEffect(fn, enableEffect)
  try {
    return fn.apply(thisArg, args)
  } finally {
    // NOTE: finally中的return会覆盖try中的return!!!
    // if (eFn === undefined) return popEffectOutFromEffectStack()
    if (eFn === undefined) popEffectOutFromEffectStack()
    else eFn.popSelfOutFromEffectStack()
  }
}

Effect.run = runEffect

function popEffectOutFromEffectStack(eFn) {
  if (effectStack.at(-1) !== eFn)
    throwErr('effectStack中的最后一个不是参数指定的eFn!')
  effectStack.pop()
  activeEffect = effectStack[effectStack.length - 1]
  // return 'test finally return'
}
/**
 * @param {EFnOptions} [options]
 * @returns {EFn} */
function effect(fn, options = {}) {
  /**@type {EFn} */
  const eFn = () => runEffect(fn)
  fn[FN_EFFECT_MAP_KEY] = eFn
  eFn[FN_EFFECT_MAP_KEY] = fn

  eFn.deps = []
  eFn.triggers = new Set()
  eFn.options = options
  /**每一个`eFn`的`popSelfOutFromEffectStack`必须新建一个,不能共用 */
  const popSelfOutFromEffectStack = () => {
    if (effectStack.at(-1) !== eFn)
      throwErr('effectStack中的最后一个不是当前的eFn!')
    popEffectOutFromEffectStack(eFn)
  }
  eFn.popSelfOutFromEffectStack = () => {
    if (!isFlushingQueue()) {
      return popSelfOutFromEffectStack()
    }
    scheduler(popSelfOutFromEffectStack)
  }
  const { scheduler: run, lazy, queueJob: qj } = options

  if (!lazy) (run || eFn)(eFn)
  if (qj || undefined === qj) options.scheduler = run ? () => run(eFn) : eFn
  return eFn
}

Object.freeze(Effect)
export { activeEffect, Effect, effect }
