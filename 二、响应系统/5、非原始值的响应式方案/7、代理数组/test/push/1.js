const { effect } = await import('../../effect/index.js')
const { reactive } = await import('../../tmp/index.js')

const state = reactive([])

// 确认push被代理后不再依赖于length
effect(
  () => {
    console.log('effect: ', state.push('liuyifei'))
  },
  {
    queueJob: false
  }
)

state.length = 0
console.log(state)

export {}
