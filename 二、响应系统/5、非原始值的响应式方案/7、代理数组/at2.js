import { effect } from './effect/index.js'
import { reactive } from './reactive/index.js'

const state = reactive(['lisa', 'lily', 'lucy'])

effect(() => {
  console.log('state[state.length - 3]的简写, state.at(-3): ', state.at(-3))
})

setTimeout(() => {
  console.log(1)
  state[state.length] = 'liuyifei'
}, 0)

setTimeout(() => {
  console.log(2)
  state.length = 3
}, 0)

setTimeout(() => {
  console.log(3)
  state.length = 0
}, 0)
