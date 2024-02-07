import { createArray } from '#utils'

const { effect } = await import('../../effect/index.js')
const { reactive } = await import('@jetjo/vue3/reactive')

const raw = createArray(0)
const state = reactive(raw)

effect(
  () => {
    // NOTE: 不合理的副作用,既依赖length又改变length
    state.length
    state.push(1)
    console.log('effect1: ', raw.length)
  },
  {
    // NOTE: 经测试和vue的表现一致
    queueJob: true
    // NOTE: 经测试和vue的表现一致
    // queueJob: false
  }
)

effect(
  () => {
    state.length
    state.push(2)
    console.log('effect2: ', raw.length)
  },
  {
    // NOTE: 经测试和vue的表现一致
    queueJob: true
    // NOTE: 经测试和vue的表现一致
    // queueJob: false
  }
)
