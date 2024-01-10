import { reactive, readonly } from '../../tmp/index.js'
import { effect } from '../../effect/index.js'
import { createArray } from '../../../../4、响应系统的作用与实现/index.js'

const raw = createArray(10)
/**@type {Array<>} */
const state = reactive(raw)

effect(() => {
  console.log(state.length)
  console.log(raw)
})

state.splice(5, 5)
