// import { createReactive } from '../api/5-7.js'
import { createReactive } from '@/reactive/api/5-8.js'
import { effect } from '@/effect/index/4-11.js'

const reactive = createReactive()()
const shallowReactive = createReactive(true)()
const readonly = createReactive(false, true)()
const shallowReadonly = createReactive(true, true)()
function test(reactiveApi) {
  const state = reactiveApi(new Set())

  const item = reactive({})

  effect(() => {
    console.log(state.has(item), 'state.has(item)')
  })

  effect(() => {
    console.log(state.size, 'state.size')
  })

  setTimeout(() => {
    state.add(item)
  }, 0)

  setTimeout(() => {
    state.delete(item)
  }, 0)

  console.log(state)
}

// test(reactive)
// test(shallowReactive)
test(readonly)
// test(shallowReadonly)
