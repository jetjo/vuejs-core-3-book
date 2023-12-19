import { activeEffect, effect } from './1-effect-fn-reg.js'

// 收集副作用的集合
const bucket = new Set()

// 缺点: 没有将副作用的依赖精确到target及其字段
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      activeEffect && bucket.add(activeEffect)
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      bucket.forEach(ef => ef())
      // 返回true, 表示属性赋值成功
      return true
    }
  })
}

const state = reactive({ txt: 'hello world! ' })

window.addEventListener('load', () => {
  effect(() => {
    console.log('effec run')
    const el = document.getElementById('app')
    el.innerText = state.txt
  })
})

setTimeout(() => {
  // 副作用并不依赖`noExist`属性, 按理不应该触发副作用
  console.log('设置没有副作用依赖的属性')
  state.noExist = 'hello vue3! '
}, 10000)
