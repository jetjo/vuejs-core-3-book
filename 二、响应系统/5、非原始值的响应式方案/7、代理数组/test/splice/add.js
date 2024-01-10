import { reactive, readonly } from '../../tmp/index.js'
import { effect } from '../../effect/index.js'

const raw = []
/**@type {Array<>} */
const state = reactive(raw)

effect(() => {
  console.log(state.length)
  console.log(raw)
})

state.splice(0, 0, readonly(reactive({})))
