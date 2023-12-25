/* 跳过响应性数据的中间态 */

import {
  warn,
  Array_MaxLen,
  error
} from '../11-竞态问题与过期的副作用/utils/index.js'

let jobQueue
const jobArray = []
// 用于将任务排入微任务列队
// 当同步代码执行完毕时,
// 就会执行并清空所有微任务列队的代码.
const microTasker = Promise.resolve()

// 是否正在刷新任务列队
// 即同步代码是否还在执行
// 因为同步代码的执行可能更改响应式数据,
// 从而导致副作用任务排入`jobArray`
function isFlushingQueue() {
  // 按照约定,执行`flushJob`前,
  // 会先将任务插入`jobArray`,
  // 所以这么判断
  return jobArray.length > 1
}

function hasSchedulerTask() {
  return jobArray.length > 0
}

function flushJob() {
  if (isFlushingQueue()) return
  microTasker.then(() => {
    warn('run micro effect job')
    // 副作用job的执行可能导致新的副作用任务插入`jobArray`
    // 所以拷贝一份,并去重
    jobQueue = new Set(jobArray)
    jobArray.length = 0
    jobQueue.forEach(job => job())
    jobQueue.clear()
    warn('micro effect job done')
  })
}
// [Vue warn]: Maximum recursive updates exceeded
const MAX_RECURSIVE_UPDATES = 102400

function overMaxRecursiveLimit(efn) {
  const i = jobArray.reduce((i, e) => {
    if (efn === e) i++
    return i
  }, 0)
  if (i > MAX_RECURSIVE_UPDATES) {
    error('over max recursive limit')
    return true
  }
  return false
}

function scheduler(effectFnScheduler) {
  warn('queue micro effect job...')
  // function scheduler(effectFn) {
  // 这样Set的自动去重不起作用了
  // jobQueue.add(() => effectFn.options.scheduler(effectFn))
  // if (overMaxRecursiveLimit(effectFnScheduler)) return
  if (jobArray.length === Array_MaxLen) {
    error('job queue is full')
    return
  }
  jobArray.push(effectFnScheduler)
  flushJob()
}

const effectCleaners = []
const microTaskerForEffectCleaner = Promise.resolve()
function flushJobCleaner() {
  if (effectCleaners.length > 1) return
  microTaskerForEffectCleaner.then(() => {
    warn('run micro clean job')
    const cleaners = [...effectCleaners]
    effectCleaners.length = 0
    cleaners.forEach(job => job())
    warn('micro clean job done')
  })
}
function schedulerEffectEnder(effectCleaner) {
  warn('queue micro effect cleaner...')
  if (effectCleaners.length === Array_MaxLen) {
    error('cleaner queue is full')
    effectCleaner()
    return
  }
  effectCleaners.unshift(effectCleaner)
  flushJobCleaner()
}

export { scheduler, hasSchedulerTask as isFlushingQueue, schedulerEffectEnder }
