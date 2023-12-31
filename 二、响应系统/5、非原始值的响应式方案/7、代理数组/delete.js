import { createArray } from '../../4、响应系统的作用与实现/index.js'
import { effect } from './effect/index.js'
import { reactive } from './reactive/index.js'

const raw = createArray(3)
const state = reactive(raw)

effect(() => {
  console.log(state.length, 'effect')
})

// console.log(raw)

delete state[2]
console.log(raw)
