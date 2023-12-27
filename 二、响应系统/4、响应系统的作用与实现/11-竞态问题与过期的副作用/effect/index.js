/* @4-4 分支与cleanup */
/* @4-5 effect嵌套与effect栈 */
/* @4-6 避免effect递归死循环 */
/* @4-7 副作用的调度执行 */

import { Array_MaxLen } from '../utils/array.js'
import { error, throwErr, warn, log } from '../utils/log.js'
import { FN_EFFECT_MAP_KEY } from './convention.js'
import { scheduler } from './scheduler.js'

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

/**@param {EFn} [eFn]  */
function __lazyTrack(eFn) {
  if (eFn !== undefined) {
    return !eFn.options.queueJob
  }
  return !latestActiveEffect?.options.queueJob
}

/**@typedef {typeof Effect} EffectM */
function isEfn(eFn) {
  return (
    eFn !== undefined &&
    eFn[FN_EFFECT_MAP_KEY] !== undefined &&
    eFn[FN_EFFECT_MAP_KEY][FN_EFFECT_MAP_KEY] === eFn
  )
}
/**
 * 收集副作用的依赖项
 * @param {Object} args
 * @param {!Set<EFn>} args.deps
 * @param {EFn} [args.effectJustPopOutFromStack]
 * */
function track({ deps, isFromHasTrap, effectJustPopOutFromStack }) {
  if (isEfn(effectJustPopOutFromStack)) {
    // if (__lazy Track && isEfn(effectJustPopOutFromStack)) {
    const eFn = effectJustPopOutFromStack
    eFn.deps.forEach(s => s.add(eFn))
    if (typeof eFn.hasTrapDeps !== 'undefined') {
      eFn.hasTrapDeps.forEach(s => s.add(eFn))
    }
    return
  }
  if (!activeEffect || !deps) throwErr('activeEffect不应该是空!')
  const isLazyTrack = __lazyTrack(activeEffect)
  !isLazyTrack && deps.add(activeEffect)
  if (isFromHasTrap) {
    if (typeof activeEffect.hasTrapDeps === 'undefined')
      activeEffect.hasTrapDeps = []
    !isLazyTrack && activeEffect.hasTrapDeps.push(deps)
    return
  }
  activeEffect.deps.push(deps)
}

Object.defineProperty(Effect, 'track', {
  get() {
    return track
  }
})

/**
 * @param {Object} args
 * @param {WeakMap<EFn, WeakMap<, Set<string>>>} args.triggerBucket
 * @param {EFn} [args.effectJustPopOutFromStack]
 *  */
function* trackTriggers({ triggerBucket, effectJustPopOutFromStack }) {
  if (isEfn(effectJustPopOutFromStack)) {
    // if (__lazy Track && isEfn(effectJustPopOutFromStack)) {
    const eFn = effectJustPopOutFromStack
    eFn.__triggers.forEach(s => eFn.triggers.add(s))
    eFn.__triggers.clear()
    return
  }
  if (!triggerBucket) throwErr('triggerBucket不应该是空!')
  const afs = effectStack.filter(ef => ef !== undefined && !ef.isConvergence)
  if (afs.length === 0) return
  /**
   * @type {{
   * triggerMap: WeakMap<, Set<string>>
   * triggerSet: Set<string>}}
   */
  let map_set
  /**@type {(ef: EFn) => void} */
  const triggerTacker = __lazyTrack()
    ? ef => ef.__triggers.add(map_set.triggerSet)
    : ef => ef.triggers.add(map_set.triggerSet)
  for (const ef of afs) {
    map_set = yield ef
    triggerBucket.set(ef, map_set.triggerMap)
    afs.forEach(triggerTacker)
    // return 0
  }
}

Object.defineProperty(Effect, 'trackTriggers', {
  get() {
    return trackTriggers
  }
})

/**@description effectStack栈顶的effect不是undefined */
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

// [Vue warn]: Maximum recursive updates exceeded
// const MAX_RECURSIVE_UPDATES = 202
// const MAX_RECURSIVE_UPDATES = 118 //最多递归嵌套110左右层, 再多就会报错
const MAX_RECURSIVE_UPDATES = 100
// const MAX_SYNC_CALL_UPDATES = 202 // vue???
const MAX_SYNC_CALL_UPDATES = 200

function overMaxRecursiveLimit(efn) {
  if (efn === undefined) return false
  const i = effectStack.reduce((i, e) => {
    if (efn === e) i++
    return i
  }, 0)
  if (i > MAX_RECURSIVE_UPDATES) {
    error('over max recursive limit')
    return true
  }
  return false
}

/**@type {Set<EFn>} */
const schedulerJobs = new Set()

setInterval(() => {
  schedulerJobs.forEach(ef => {
    if (ef === undefined) return
    ef.syncCallCounter = 0
  })
  schedulerJobs.clear()
  warn('clear schedulerJobs')
}, 1000)

/**@description 离effectStack栈顶最近的不是undefined的effect */
let latestActiveEffect = undefined

Object.defineProperty(Effect, 'latestActiveEffect', {
  get() {
    return latestActiveEffect
  }
})

function getLatestActiveEffect() {
  latestActiveEffect = undefined
  let i = -1
  while (-1 * i <= effectStack.length) {
    const e = effectStack.at(i--)
    if (e === undefined) continue
    latestActiveEffect = e
    return
  }
}
function isCurrentActive(efn) {
  getLatestActiveEffect()
  return latestActiveEffect === efn
}

/**@param {EFn} efn */
Effect.scheduler = function (efn, cb) {
  // if (efn === activeEffect || effectStack.includes(efn)) return
  // if (efn === activeEffect || overMaxRecursiveLimit(efn)) return
  if (isCurrentActive(efn)) return
  efn.syncCallCounter++
  log(`scheduler: ${efn.__number_id}: ${efn.syncCallCounter}`)
  // if (efn.syncCallCounter === MAX_SYNC_CALL_UPDATES) debugger
  if (efn.syncCallCounter > MAX_SYNC_CALL_UPDATES) {
    error(`scheduler: ${efn.__number_id}: ${efn.syncCallCounter}`)
    error('over max sync call limit')
    // efn.syncCallCounter = 0
    return
  }
  // schedulerJobs.push(efn)
  schedulerJobs.add(efn)
  try {
    const { scheduler: run, mustSynCallPre } = efn.options
    mustSynCallPre && mustSynCallPre()
    if (run) scheduler(run)
    else {
      warn('run sync job')
      efn(efn)
    }
    cb && cb()
  } finally {
    // schedulerJobs.pop()
  }
}

/**
 * 副作用函数
 * @typedef EFnConf
 * @property {!(!Set<EFn>)[]} deps - 包含此EFn的集合们, 没有去重
 * @property {(!Set<EFn>)[]} [hasTrapDeps] - 当这个副作用只依赖于相应的属性的有无时, 包含此副作用的集合会存入这里, 没有去重
 * @property {!Set<!Set<string>>} triggers - 包含此EFn修改过的属性的集合
 * @property {!Set<!Set<string>>} __triggers
 * @property {function(): void} popSelfOutFromEffectStack
 * @property {boolean} isConvergence effect没有修改自己的依赖, 或者修改了自身的依赖项,但是这种修改不会引起无尽的递归(自调用)
 * @property {BigInt} __number_id
 * @property {number} syncCallCounter
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
  if (!isEfn(eFn)) return
  eFn.deps.forEach(s => s.delete(eFn))
  eFn.deps.length = 0
  if (typeof eFn.hasTrapDeps !== 'undefined') {
    eFn.hasTrapDeps.forEach(s => s.delete(eFn))
    eFn.hasTrapDeps.length = 0
  }
  eFn.triggers.forEach(s => s.clear())
  eFn.triggers.clear()
  eFn.isConvergence = true
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
  if (enableEffect && eFn === undefined) {
    throwErr('fn没有对应的eFn!')
    return undefined
  }
  if (eFn) {
    if (overMaxRecursiveLimit(eFn) || effectStack.length === Array_MaxLen) {
      error('over max recursive limit, or the effectStack is full')
      return undefined
    }
    cleanup(eFn)
  }
  return eFn
}

function runEffect(fn, enableEffect = true) {
  return applyEffect(fn, enableEffect, undefined)
}

function applyEffect(fn, enableEffect, thisArg, ...args) {
  if (enableEffect === undefined) throwErr('enableEffect不能是undefined')
  const eFn = prepareEffect(fn, enableEffect)
  if (enableEffect && eFn === undefined) {
    warn('Prepare the effect failed!!!')
    return
  }
  activeEffect = eFn
  effectStack.push(eFn)
  getLatestActiveEffect()
  try {
    return fn.apply(thisArg, args)
  } finally {
    // NOTE: finally中的return会覆盖try中的return!!!
    effectStack.pop()
    activeEffect = effectStack.at(-1)
    getLatestActiveEffect()
  }
}

Effect.run = runEffect

Effect.setConvergenceFlag = f => {
  if (activeEffect === undefined) return
  activeEffect.isConvergence = !!f
}

let _allEffectCounter = 0n
/**
 * @param {EFnOptions} [options]
 * @returns {EFn} */
function effect(fn, options = {}) {
  /**@type {EFn} */
  const eFn = () => runEffect(fn)
  eFn.__number_id = options._id || ++_allEffectCounter
  fn[FN_EFFECT_MAP_KEY] = eFn
  eFn[FN_EFFECT_MAP_KEY] = fn

  eFn.deps = []
  eFn.triggers = new Set()
  eFn.__triggers = new Set()
  eFn.options = options
  eFn.isConvergence = true
  eFn.syncCallCounter = 0

  const { scheduler: run, lazy, queueJob: qj } = options

  if (!lazy) (run || eFn)(eFn)
  if (qj || undefined === qj) options.scheduler = run ? () => run(eFn) : eFn
  return eFn
}

Object.freeze(Effect)
export { activeEffect, Effect, effect }
