/* VueJs 中 watch api的基本实现 */
import { effect } from '../8-计算属性与lazy/1-effect-fn-reg.js'
import { bucket } from './2-reactive.js'
import { isReactive } from './2-reactive-deep.js'

const FLUSH_RANG = ['pre', 'post', 'sync']

function watch(target, cb, options = {}) {
  if (FLUSH_RANG.indexOf(options.flush) === -1) options.flush = 'post'
  // watch是暴露给用户的使用arguments传参可能出错,例如当用户传递的参数不是3个时
  // if (typeof target === 'function') return watchFn(...arguments)
  if (typeof target === 'function') {
    delete options.isDeepWatch
    delete options.isIterateWatch
    options.isWatchReactiveObj = false
    return watchFn(target, cb, options)
  } else if (isReactive(target)) {
    if (typeof options.isDeepWatch !== 'boolean') options.isDeepWatch = true
    if (typeof options.isIterateWatch !== 'boolean')
      options.isIterateWatch = true
    options.isWatchReactiveObj = true
    return watchReactive(target, cb, options, {
      isDeepWatch: options.isDeepWatch,
      isIterateWatch: options.isIterateWatch
    })
  }
}

/**@deprecated */
function watchFnOld(fn, cb, options = {}) {
  let newVal
  let oldVal
  // let dirty ;
  const effectFn = effect(fn, {
    lazy: true,
    scheduler(efn) {
      // dirty = true
      oldVal = newVal
      newVal = effectFn()
      cb(newVal, oldVal)
    },
    queueJob: true
  })
  newVal = effectFn()
  // 这样,immediate的意思就是只执行cb
  // 缺点是可能造成第一次与后续scheduler的行为不一致???
  if (options.immediate) {
    cb(newVal, oldVal)
  }
}
function watchFn(fn, cb, options = {}) {
  const job = () => {
    // oldVal = newVal
    newVal = effectFn()
    cb(newVal, oldVal)
    oldVal = newVal
  }
  let newVal, oldVal
  const effectFn = effect(fn, {
    lazy: true,
    scheduler: job,
    queueJob: options.flush === 'post',
    // 可以是`sync` | `post` | `pre`
    flush: options.flush,
    needTrapIterabe: options.isIterateWatch
  })
  if (options.immediate) {
    job()
  } else {
    oldVal = effectFn()
  }
}

/**@param {Set<any>} [seen=new Set()] 存放已经被遍历过的obj */
function traverseRactiveObjDeep(obj, seen = new Set()) {
  /*   假如obj的成员中有对obj的引用,
  比如obj = {_self: obj},
  为例防止死循环,
  需要seen.has(obj). */
  if (typeof obj !== 'object' || obj === null || seen.has(obj)) return
  if (Array.isArray(obj)) traverseRactiveArrDeep(obj, seen)
  seen.add(obj)
  for (const key in obj) {
    // if (Object.hasOwnProperty.call(obj, key)) {
    // 依赖收集发生在此处
    /* TODO: 有待改进,
    假如cb(watch api的第二个参数)中有对obj的遍历操作,
    那么cb应该依赖于ITERATE_KEY,
    而不是依赖于单独的各个key. */
    const element = obj[key]
    traverseRactiveObjDeep(element, seen)
    // }
  }
  // 需要返回obj,否则watch 回调收到的oldVal和newVal都是undefined
  return obj
}
function traverseRactiveArrDeep(array, seen = new Set()) {
  throw new Error(`此功能正在路上...`)
}

function getTraverser(target, wOpt = {}) {
  const objType = Array.isArray(target) ? 'array' : typeof target
  if (wOpt.isDeepWatch) {
    // if (objType === 'array') return () => traverseRactiveArrDeep(target)
    if (objType === 'array') return traverseRactiveArrDeep
    // else if (objType === 'object') return () => traverseRactiveObjDeep(target)
    else if (objType === 'object') return traverseRactiveObjDeep
    else throw new Error(`不支持对${objType}类型的watch`)
  } else throw new Error(`此功能正在路上...`)
}

function watchReactive(target, cb, options, wOpt = {}) {
  const traverser = getTraverser(target, wOpt)
  watchFn(() => traverser(target), cb, options)
}

export { watch }
