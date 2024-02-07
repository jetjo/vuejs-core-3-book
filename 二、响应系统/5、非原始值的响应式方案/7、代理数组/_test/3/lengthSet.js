import { effect } from '../../effect/index.js'
import { reactive } from "@jetjo/vue3/reactive";
const state = reactive([])

effect(() => {
  console.log(state.length)
})

state.length = 100
