import { effect } from '../effect/index.js'
import { reactive } from '../reactive/index.js'

const state = reactive([
  'lisa',
  'lily',
  {
    name: 'lucy'
  }
])

let stateWithRes
let stateWithRes1
effect(
  () => {
    stateWithRes = state.with(2, state.at(2))
    stateWithRes1 = state.with(0, state.at(0))
    console.log(
      stateWithRes,
      stateWithRes1,
      stateWithRes.at(-1),
      stateWithRes.at(-1) === stateWithRes1.at(-1),
      stateWithRes.at(-1) === state.at(-1)
    )
  },
  { queueJob: false }
)

setTimeout(() => {
  console.log('更改with返回的浅拷贝:')
  // 上面的副作用按理也算依赖于stateWithRes,
  // 但目前with方法返回的结果没有经过reactive处理, 所以不会触发副作用.
  // 这和VUE的实现一样,对with方法返回的结果不做代理.
  stateWithRes[stateWithRes.length - 1] = 'liuyifei'
}, 0)

setTimeout(() => {
  console.log('更改原始状态:')
  state[state.length - 1] = 'liuyifei'
}, 0)
