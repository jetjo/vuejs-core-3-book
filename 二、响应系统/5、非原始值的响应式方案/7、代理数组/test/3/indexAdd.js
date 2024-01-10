import { effect } from '../../effect/index.js'

const { reactive } = await import('../../tmp/index.js')

const state = reactive([])

effect(() => {
  console.log(state.length)
})
state[100] = ''
