/* 对副作用函数的注册及执行机制的封装 */

// 储存当前正在被执行的副作用
let activeEffect

// 注册并执行副作用函数
function effect(fn) {
  activeEffect = fn
  fn()
}

export { activeEffect, effect }
