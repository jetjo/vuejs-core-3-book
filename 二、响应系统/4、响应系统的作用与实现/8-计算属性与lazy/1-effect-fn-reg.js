/* 副作用注册逻辑封装 */
/* 分支切换与cleanup */
/* 避免无限递归循环 */
/* 支持副作用嵌套 netsted effect */
/* 支持调度 */
/* 支持计算属性 */

let activeEffect
let effectStack = []

function cleanup(efn) {
  efn.deps.forEach(set => set.delete(efn))
  efn.deps.length = 0
}

function effect(fn, options = {}) {
  if (typeof options === 'number') options = { fnId: options }
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }

  effectFn.deps = []
  effectFn.fnId = options.fnId
  effectFn.options = options
  const { scheduler, queueJob } = options
  if (scheduler && queueJob) {
    // 无限自调用、死循环...
    // options.scheduler = () => options.scheduler(effectFn)

    // 将原来的`scheduler`与调用`scheduler`时所需的参数`effectFn`做一个绑定
    // 以便从任务列队中取出并调用`scheduler`时不用再次传递参数
    effectFn.options.scheduler = () => scheduler(effectFn)
  }
  // effectFn()
  // 支持计算属性,
  // 但保持一致的返回.
  // 延迟副作用的收集直至需要的时候.
  if (!options.lazy) {
    /* return  */ effectFn()
  }
  // else
  return effectFn
}

export { effect, activeEffect }
