import { effect } from '../../effect/index.js'

const { reactive } = await import('@jetjo/vue3/reactive')

const state = reactive([])

effect(() => {
  console.log(state.length)
})
state[100] = ''
