const { effect } = await import('./effect/index.js')
const { reactive } = await import('./reactive/index.js')

const state = reactive([])

effect(
  () => {
    console.log('合理的effect: ', state.length)
    console.log('合理的effect: ', state)
  },
  {
    queueJob: false
  }
)
effect(
  () => {
    console.log('合理的effect2: ', state.push('liuyifei'))
  },
  {
    queueJob: false
  }
)

// setTimeout(() => {
//   debugger
effect(() => {
  state.length
  state.push(1)
})
effect(() => {
  state.length
  state.push(2)
})
// }, 5000)

state.push(3)

export {}
