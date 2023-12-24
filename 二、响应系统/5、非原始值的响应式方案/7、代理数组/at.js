import { effect } from './effect/index.js'
import { reactive } from './reactive/index.js'

const state = reactive(['lisa', 'lily', 'lucy'])

effect(() => {
  console.log('state[state.length - 1]的简写, state.at(-1): ', state.at(-1))
  console.log('state[state.length - 2]的简写, state.at(-2): ', state.at(-2))
})

state[state.length - 1] = 'lucy1'
state[state.length - 2] = 'lily1'

setTimeout(() => {
  state.pop()
}, 0)
