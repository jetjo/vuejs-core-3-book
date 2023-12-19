/** @typedef ER */
/**
 * @callback ECB
 * @param {ER} newVal
 * @param {ER} [oldVal]
 * @param {() => void} [rs] 注册(同步的清理上一次的失效副作用的)回调
 */

import { Effect, effect } from '../effect/index.js'
import { isReactive } from '../reactive/traps/convention.js'
import { requireReactiveTarget } from '../reactive/traps/helper.js'
import { warn } from '../utils/index.js'
import { FLUSH_TYPE } from './convention.js'

/**
 * 对副作用(target)的执行结果交由非副作用函数cb进一步处理,
 * 和computed api不同,
 * watch不对副作用(target)的结果进行缓存
 * @param {ER | () => ER} target
 * @param {ECB} cb
 * @param {{immediate: boolean}} [options={}]
 * @returns {undefined | (() => void)}
 */
function watch(target, cb, options = {}) {
  if (options.flush === undefined) options.flush = FLUSH_TYPE.post
  if (!requireReactiveTarget(target, false)) return
  for (let i = watchers.length - 1; i >= 0; i--) {
    const watcher = watchers[i]
    const cb = watcher(...arguments)
    if (cb) return cb
  }
  warn('暂未支持的watch target')
}

function watchFn(fn, cb, options = {}) {
  let oldVal, newVal, finalValWithCanceled, cleanExpiredEffect // 默认空函数造成不必要的出入栈 = () => void 0

  /**@param {() => void} cb */
  function registerExpiredEffectCleaner(cb) {
    cleanExpiredEffect = cb
  }
  function mustSynCallPre() {
    if (cleanExpiredEffect) {
      Effect.runWithoutEffect(() => {
        cleanExpiredEffect()
      })
    }
  }
  function job() {
    newVal = finalValWithCanceled || efn()
    Effect.runWithoutEffect(() => {
      cb(newVal, oldVal, registerExpiredEffectCleaner)
    })
    oldVal = newVal
    // finalValWithCanceled = undefined
  }
  const efn = effect(fn, {
    lazy: true,
    // TODO: 还未考虑pre
    queueJob: options.flush === FLUSH_TYPE.post,
    scheduler: job,
    mustSynCallPre
  })

  if (options.immediate) job()
  else oldVal = efn()
  return () => {
    // TODO: 不能解决问题,因为值可能是引用类型,甚至是proxy
    finalValWithCanceled = efn()
    Effect.cleanup(efn)
  }
}

/**@param {Set<any>} [seen=new Set()] 存放已经被遍历过的obj */
function traverseObj(obj, seen = new Set()) {
  if (Array.isArray(obj)) throw new Error('暂未支持!')
  /*   假如obj的成员中有对obj的引用,
  比如obj = {_self: obj},
  为例防止死循环,
  需要seen.has(obj). */
  // const cancel = obj => typeof obj !== 'object' || obj === null || seen.has(obj)
  // const cancel = obj => !isReactive(obj) || seen.has(obj)
  const cancel = obj => !requireReactiveTarget(obj, false) || seen.has(obj)
  if (cancel(obj)) return
  seen.add(obj)
  for (const key in obj) {
    // if (Object.hasOwnProperty.call(obj, key)) {
    // 依赖收集发生在此处
    const element = obj[key]
    // if (cancel(element) || isShallowReactive(obj)) continue
    if (cancel(element)) continue
    traverseObj(element, seen)
    // }
  }
  // 需要返回obj,否则watch 回调收到的oldVal和newVal都是undefined
  return obj
}

const watchers = [
  function (target, cb, options) {
    if (typeof target === 'function') {
      return watchFn(...arguments)
    }
  },
  function (target, cb, options) {
    if (
      isReactive(target) &&
      typeof target !== 'function' &&
      !Array.isArray(target)
    ) {
      const getter = () => traverseObj(target)
      return this[0](getter, cb, options)
    }
  },
  function (target, cb, options) {
    if (Array.isArray(target) && !isReactive(target)) {
      const getter = () => {
        return target.map(o => {
          if (isReactive(o)) return traverseObj(o)
          return o
        })
      }
      return this[0](getter, cb, options)
    }
  }
].map((f, i, ws) => f.bind(ws))

function registerWatcher(watcher) {
  watchers.push(watcher.bind(watchers))
}

export { watch, registerWatcher }
