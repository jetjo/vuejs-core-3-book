import { reactive } from './reactive/index.js'
import { effect } from './effect/index.js'

const state = reactive(['foo', 'bar', 'foo', 'bar'])

effect(() => {
  // console.log(state.copyWithin(0, 1, 2))
  ;[state[0], state[1]] = [state[1], state[0]]
  console.log(1, state)
})

let i = 0
effect(() => {
  // if (i % 2 === 0) console.log(state.copyWithin(1, 2, 3))
  // else console.log(state.copyWithin(1, 3, 4))
  // console.log(state[0], i++)
  ;[state[0], state[1]] = [state[1], state[0]]
  console.log(2, state)
})
