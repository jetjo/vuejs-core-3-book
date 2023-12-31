import { reactive } from './reactive/index.js'
import { effect } from './effect/index.js'
import { createArray } from '../../4、响应系统的作用与实现'

const raw = createArray(3)
const state = reactive(raw)

effect(() => {
  for (const key in state) {
    if (Object.hasOwnProperty.call(state, key)) {
      const element = state[key]
      console.log(element, 'effect')
    }
  }
})

state.name = '刘亦菲'
