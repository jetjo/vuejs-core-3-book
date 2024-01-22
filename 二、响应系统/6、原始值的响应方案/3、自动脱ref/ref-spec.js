import { createReactive } from '@/reactive/api/5-8.js'
import { proxyRefs, toRefs } from './convention.sl.js'
import { queueMacroTask, warn } from '@/utils/index.js'
import { effect } from '@/effect/index/4-11.js'

const reactive = createReactive()()

const _state = reactive({ foo: 'foo', bar: 'bar' })

const state = proxyRefs(toRefs(_state))

const fooEFnSpy = v => warn(v, 'foo')
const barEFnSpy = v => warn(v, 'bar')

effect(() => {
  fooEFnSpy(state.foo)
  barEFnSpy(state.bar)
})

await queueMacroTask()
state.foo = 'foo~~~1'
await queueMacroTask()
state.bar = '2'
