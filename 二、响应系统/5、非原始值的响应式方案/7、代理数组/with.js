import { effect } from './effect/index.js'
import { reactive } from './reactive/index.js'

const state = reactive(['lisa', 'lily', 'lucy'])

effect(() => {
  console.log(state.with(0, state.at(0)))
})

setTimeout(() => {
  state[state.length - 1] = 'liuyifei'
}, 0)

setTimeout(() => {
  state.length = 2
}, 0)
