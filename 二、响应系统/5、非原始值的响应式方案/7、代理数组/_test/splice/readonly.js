import { reactive, readonlyReactive } from '@jetjo/vue3/reactive'

/**@type {Array<>} */
const state = readonlyReactive([1, 2, 3])

state.splice(1, 1, 0, 0, 0)
