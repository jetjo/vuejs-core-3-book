import { reactive } from './reactive/index.js'
import { effect } from './effect/index.js'

const state1 = reactive([])
const state2 = reactive({})

// setTimeout(() => {
let i = 0
effect(
  () => {
    state2.name
    // debugger
    state1.push(i++)
    console.log('副作用1')
  },
  { queueJob: true }
)

effect(
  () => {
    state1.length
    // debugger
    state2.name = `liuyifei${i++}`
    console.log('副作用2')
  },
  { queueJob: true }
)
// }, 5000)
