/* 对副作用函数的注册及执行机制的封装 */
/* 实现分支切换前的cleanup */

// 储存当前正在被执行的副作用
let activeEffect

// 注册并执行副作用函数
function effect(fn) {
  /*   fn.__v_deps = [];
  activeEffect = fn
  fn() */
  const effectFn = () => {
    // 副作用的执行会触发依赖收集
    // 在依赖收集前,清除上一次手机的依赖,
    // 因为副作用中条件语句分支的缘故,
    // 副作用所依赖的对象和字段并不总是不变的
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
    // TODO:
    // activeEffect = undefined;
  }

  effectFn.deps = []
  effectFn()
}

function cleanup(efn) {
  efn.deps.forEach(set => set.delete(efn))
  efn.deps.length = 0
}

export { activeEffect, effect }
