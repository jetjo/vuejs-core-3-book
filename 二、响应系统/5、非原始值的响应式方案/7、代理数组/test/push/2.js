const { effect } = await import('../../effect/index.js')
const { reactive } = await import('../../tmp/index.js')

const state = reactive([])

effect(
  () => {
    console.log('effect1: ', state.length)
    console.log('effect1: ', state)
  },
  {
    queueJob: false
  }
)

// 确认被代理后的push仍然能够触发依赖length的effect
effect(
  () => {
    console.log('effect2: ', state.push('liuyifei'))
  },
  {
    queueJob: false
  }
)

export {}
