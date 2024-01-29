/* 跳过响应性数据的中间态 */

import { warn, error } from '#utils'

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

function flushJob() {
  if (isFlushingQueue()) return
  microTasker.then(() => {
    // 副作用job的执行可能导致新的副作用任务插入`jobArray`
    // 所以拷贝一份,并去重
    jobQueue = new Set(jobArray)
    warn('run micro effect job', jobArray.length, jobQueue.size)
    jobArray.length = 0
    jobQueue.forEach(job => job())
    jobQueue.clear()
    warn('micro effect job done')
  })
}

const MAX_SYNC_CALL_UPDATES = 200

function overMaxSyncCallLimit(efn) {
  const i = jobArray.reduce((i, e) => {
    if (efn === e) i++
    return i
  }, 0)
  if (i > MAX_SYNC_CALL_UPDATES) {
    error('over max sync call limit')
    return true
  }
  return false
}

function scheduler(effectFnScheduler) {
  warn('queue micro effect job...')
  // function scheduler(effectFn) {
  // 这样Set的自动去重不起作用了
  // jobQueue.add(() => effectFn.options.scheduler(effectFn))
  if (overMaxSyncCallLimit(effectFnScheduler)) return
  jobArray.push(effectFnScheduler)
  flushJob()
}

export { scheduler }
