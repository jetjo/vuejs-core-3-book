import { effect } from './1-effect-fn-reg.js'
import { reactive } from './2-reactive.js'

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
