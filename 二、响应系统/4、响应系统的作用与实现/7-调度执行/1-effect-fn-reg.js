/* 对副作用函数的注册及执行机制的封装 */
/* 实现分支切换前的cleanup */
/* 实现effect栈以支持effect嵌套 */
/* 支持调度执行 */

let activeEffect
let effectStack = []

function cleanup(efn)
{
  efn.deps.forEach(set => set.delete(efn))
  efn.deps.length = 0
}

function effect(fn, options = {})
{
  const popStack = () =>
  {
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  // inner command
  const effectFn = () =>
  {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    // if (options.scheduler) return;
    popStack()
  }

  effectFn.deps = []
  effectFn.options = options
  if (options.scheduler)
  {
    // if (options.queueJob) {
    // 无限自调用、死循环...
    // options.scheduler = () => options.scheduler(effectFn)
    const run = options.scheduler
    // 提前备好outer command，不是每次调度时都生成新的command, 否则可能造成scheduler模块的任务去重失效
    options.scheduler = () => run(effectFn, popStack)
    // if (run) {
    //   options.scheduler = () => run(effectFn)
    // } else {
    //   options.queueJob = false
    //   console.warn('配置错误...')
    // }
    return run(effectFn, popStack)
  }
  if (options.queueJob)
  {
    delete options.queueJob
    options.scheduler = () => effectFn()
  }
  effectFn()
}

export { activeEffect, effect }
