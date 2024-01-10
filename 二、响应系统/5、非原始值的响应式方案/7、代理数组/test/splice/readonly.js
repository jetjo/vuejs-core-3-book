import { readonly } from '../../tmp/index.js'

/**@type {Array<>} */
const state = readonly([1, 2, 3])

state.splice(1, 1, 0, 0, 0)
