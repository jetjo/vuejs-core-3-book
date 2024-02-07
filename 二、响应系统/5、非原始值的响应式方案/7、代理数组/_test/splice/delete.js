import { reactive, readonlyReactive } from '@jetjo/vue3/reactive'
import { effect } from '../../effect/index.js'
import { createArray } from '#utils'

const raw = createArray(10)
/**@type {Array<>} */
const state = reactive(raw)

effect(() => {
  console.log(state.length)
  console.log(raw)
})

state.splice(5, 5)
