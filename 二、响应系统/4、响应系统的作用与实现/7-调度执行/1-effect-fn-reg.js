/* 对副作用函数的注册及执行机制的封装 */
/* 实现分支切换前的cleanup */
/* 实现effect栈以支持effect嵌套 */
/* 支持调度执行 */

let activeEffect
let effectStack = []

function cleanup(efn) {
  efn.deps.forEach(set => set.delete(efn))
  efn.deps.length = 0
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn.deps = []
  effectFn.options = options
  if (options.queueJob) {
    // 无限自调用、死循环...
    // options.scheduler = () => options.scheduler(effectFn)
    const run = options.scheduler
    options.scheduler = () => run(effectFn)
    // if (run) {
    //   options.scheduler = () => run(effectFn)
    // } else {
    //   options.queueJob = false
    //   console.warn('配置错误...')
    // }
  }
  effectFn()
}

export { activeEffect, effect }
