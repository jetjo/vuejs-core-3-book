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
/**
 * 栈顶的effect
 * @type {EFn} */
let activeEffect = undefined
/**@type {EFn[]} */
const effectStack = []

function Effect() {}

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
 * */
function track({ deps, effectJustPopOutFromStack }) {
  if (effectJustPopOutFromStack !== undefined) {
    /**@type {EFn} */
    const eFn = effectJustPopOutFromStack
    eFn.deps.forEach(s => s.add(eFn))
    return
  }
  if (!deps) throwErr('deps不应该是空!')
  if (!activeEffect) throwErr('activeEffect不应该是空!')
  // deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

Effect.track = track

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

// [Vue warn]: Maximum recursive updates exceeded
// const MAX_RECURSIVE_UPDATES = 202
// const MAX_RECURSIVE_UPDATES = 118 //最多递归嵌套110左右层, 再多就会报错
const MAX_RECURSIVE_UPDATES = 100
// const MAX_SYNC_CALL_UPDATES = 202 // vue???
const MAX_SYNC_CALL_UPDATES = 200

function overMaxRecursiveLimit(efn) {
  if (efn === undefined || efn.options.queueJob) return false
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
 * @property {!Set<!Set<string>>} triggers - 包含此EFn修改过的属性的集合
 * @property {!Set<!Set<string>>} __triggers
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
  eFn.triggers.forEach(s => s.clear())
  eFn.triggers.clear()
}
// 外部依赖她
Effect.cleanup = cleanup

Effect.runWithoutEffect = function (cb) {
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
  eFn && cleanup(eFn)
  try {
    return fn.apply(thisArg, args)
  } finally {
    // NOTE: finally中的return会覆盖try中的return!!!
    effectStack.pop()
    activeEffect = effectStack.at(-1)
    getLatestActiveEffect()
    eFn && track({ effectJustPopOutFromStack: eFn })
  }
}

Effect.run = runEffect

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
  eFn.syncCallCounter = 0

  const { scheduler: run, lazy, queueJob: qj } = options

  if (!lazy) (run || eFn)(eFn)
  if (qj || undefined === qj) options.scheduler = run ? () => run(eFn) : eFn
  return eFn
}

Object.freeze(Effect)
export { activeEffect, Effect, effect }
