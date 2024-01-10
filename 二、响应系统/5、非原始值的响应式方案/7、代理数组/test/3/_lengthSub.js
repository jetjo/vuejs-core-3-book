import { effect } from '../../effect/index.js'

const { reactive } = await import('../../tmp/index.js')

const arr = Array(100).fill('刘亦菲')
const MaxLen = Math.pow(2, 32) - 1
arr[MaxLen - 1] = ''
arr[MaxLen] = ''
arr[MaxLen + 1] = ''
const sk = Symbol('老婆')
arr[sk] = 'MT-刘亦菲'
arr['老婆'] = 'MT-刘亦菲'

const state = reactive(arr)

effect(() => {
  console.log('length: ', state.length, '------------会重复')
})
effect(() => {
  console.log('state[0]: ', state[0])
})
effect(() => {
  console.log('state[90]: ', state[90], '------------会重复')
})
effect(() => {
  console.log('state[MaxLen - 1]: ', state[MaxLen - 1], '------------会重复')
})
effect(() => {
  console.log('state[MaxLen]: ', state[MaxLen])
})
effect(() => {
  console.log('state[MaxLen + 1]: ', state[MaxLen + 1])
})
effect(() => {
  console.log('state[sk]: ', state[sk])
})
effect(() => {
  console.log("state['老婆']: ", state['老婆'])
})
effect(() => {
  console.log('for...in...', '------------会重复')
  for (const key in state) {
    if (Object.hasOwnProperty.call(state, key)) {
      const element = state[key]
    }
  }
})

console.log('把数组长度减小到50: ')
state.length = 50
console.log(arr)
