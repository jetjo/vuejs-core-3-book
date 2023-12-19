/* 对副作用函数的注册及执行机制的封装 */
/* 实现分支切换前的cleanup */
/* 实现effect栈以支持effect嵌套 */

let activeEffect
let effectStack = []

// 副作用执行前清理上次执行时收集的依赖
function cleanup(efn) {
  efn.deps.forEach(set => set.delete(efn))
  efn.deps.length = 0
}

function effect(fn, fnId) {
  console.log('注册新的effct: ', { fnId })
  const effectFn = () => {
    cleanup(effectFn)
    /* 与下面effectFn1中对栈操作的不同之处:
    1、effectStack的栈底(第一个数组元素)是undefined
    而不是第一个运行的effect.
    2、当前执行的effect即activeEffect并不在栈顶(数组的最后一个元素) */
    effectStack.push(activeEffect)
    activeEffect = effectFn
    fn()
    activeEffect = effectStack.pop()
  }

  const effectFn1 = () => {
    cleanup(effectFn1)
    activeEffect = effectFn1
    effectStack.push(effectFn1)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }

  effectFn1.deps = []
  effectFn1.fnId = fnId
  effectFn1()
}

export { effect, activeEffect, effectStack }
