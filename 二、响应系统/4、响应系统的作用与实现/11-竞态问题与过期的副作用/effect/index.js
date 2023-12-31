/* @4-4 分支与cleanup */
/* @4-5 effect嵌套与effect栈 */
/* @4-6 避免effect递归死循环 */
/* @4-7 副作用的调度执行 */

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

const is = []
setInterval(() => {
  schedulerJobs.forEach(ef => {
    if (ef === undefined) return
    is.push(ef.microTaskLen)
    ef.microTaskLen = 0
  })
  schedulerJobs.clear()
  warn('clear schedulerJobs: ', is.join())
  is.length = 0
}, 1000)

/**@description 离effectStack栈顶最近的不是undefined的effect */
let latestActiveEffect = undefined

Object.defineProperty(Effect, 'latestActiveEffect', {
  get() {
    return latestActiveEffect
  }
})

function getLatestActiveEffect() {
  if (typeof Array.prototype.findLast === 'function') {
    latestActiveEffect = effectStack.findLast(e => e !== undefined)
    return
  }
  latestActiveEffect = undefined
  let i = -1
  while (-1 * i <= effectStack.length) {
    const e = effectStack.at(i--)
    if (e === undefined) continue
    latestActiveEffect = e
    return
  }
}

/**@param {EFn} efn */
Effect.scheduler = function (efn) {
  if (latestActiveEffect === efn) return
  const { scheduler: run, mustSynCallPre, queueJob } = efn.options
  if (queueJob) {
    efn.microTaskLen++
    if (efn.microTaskLen > MAX_SYNC_CALL_UPDATES) {
      error(`scheduler: ${efn.__number_id}: ${efn.microTaskLen}`)
      error('over max queue jobs limit')
      return
    }
    mustSynCallPre && mustSynCallPre()
    scheduler(run)
    schedulerJobs.add(efn)
    return
  }
  if (overMaxRecursiveLimit(efn)) return
  warn('run sync job')
  mustSynCallPre && mustSynCallPre()
  run()
}

/**
 * 副作用函数
 * @typedef EFnConf
 * @property {!(!Set<EFn>)[]} deps - 包含此EFn的集合们, 没有去重
 * @property {!Set<!Set<string>>} triggers - 包含此EFn修改过的属性的集合
 * @property {BigInt} __number_id
 * @property {number} microTaskLen
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
  // eFn.triggers.forEach(s => s.clear())
  // eFn.triggers.clear()
}
// 外部依赖她
Effect.cleanup = cleanup

Effect.runWithoutEffect = function (cb) {
  return applyEffect(cb, false, undefined)
}

Effect.applyWithoutEffect = function (cb, ...args) {
  return applyEffect(cb, false, this, ...args)
}

function applyEffect(fn, enableEffect, thisArg, ...args) {
  const eFn = (enableEffect && fn[FN_EFFECT_MAP_KEY]) || undefined
  if (enableEffect && !isEfn(eFn)) {
    throwErr('Prepare the effect failed!!!')
  }
  activeEffect = eFn
  effectStack.push(eFn)
  getLatestActiveEffect()
  enableEffect && cleanup(eFn)
  try {
    return fn.apply(thisArg, args)
  } catch (e) {
    error(e)
  } finally {
    // NOTE: finally中的return会覆盖try中的return!!!
    effectStack.pop()
    activeEffect = effectStack.at(-1)
    getLatestActiveEffect()
    enableEffect && track({ effectJustPopOutFromStack: eFn })
  }
}

let _allEffectCounter = 0n
/**
 * @param {EFnOptions} [options]
 * @returns {EFn} */
function effect(fn, options = {}) {
  if (options.queueJob === undefined) options.queueJob = true
  /**@type {EFn} */
  const eFn = () => applyEffect(fn, true, undefined)

  Object.defineProperty(eFn, '__number_id', {
    value: options._id || ++_allEffectCounter
  })
  Object.defineProperty(eFn, FN_EFFECT_MAP_KEY, {
    value: fn,
    enumerable: false
  })
  Object.defineProperty(fn, FN_EFFECT_MAP_KEY, {
    value: eFn,
    enumerable: false
  })

  eFn.deps = []
  // eFn.triggers = new Set()
  eFn.options = options
  eFn.microTaskLen = 0

  const { scheduler: bakRun, queueJob } = options
  if (queueJob) options.scheduler = bakRun ? () => bakRun(eFn) : () => eFn()
  if (!options.scheduler) options.scheduler = () => eFn()
  if (!options.lazy) options.scheduler()
  return eFn
}

Object.freeze(Effect)
export { activeEffect, Effect, effect }
