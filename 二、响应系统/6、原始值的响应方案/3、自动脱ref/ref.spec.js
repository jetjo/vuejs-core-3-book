import { describe, test, expect, vi } from 'vitest'
import { reactive } from '@jetjo/vue3/reactive'
import { proxyRefs, toRefs } from './convention.sl'
import { log, queueMacroTask, warn } from '#utils'
import { effect } from '@jetjo/vue3/effect'

// const reactive = createReactive()()

console.log(import.meta.env.NODENV_VERSION, 'nodejs版本号')

const _state = reactive({ foo: 'foo', bar: 'bar' })

const state = proxyRefs(toRefs(_state))

const fooEFnSpy = vi.fn(v => warn(v, 'foo'))
const barEFnSpy = vi.fn(v => warn(v, 'bar'))

effect(() => {
  fooEFnSpy(state.foo)
  barEFnSpy(state.bar)
})

test('自动脱ref后, 仍能正常收集依赖并触发副作用', async () => {
  expect(fooEFnSpy).toHaveBeenLastCalledWith('foo')
  expect(barEFnSpy).toHaveBeenLastCalledWith('bar')
  state.foo = 'foo~~~1'
  await queueMacroTask()
  expect(fooEFnSpy).toHaveBeenLastCalledWith('foo~~~1')
  expect(barEFnSpy).toHaveBeenLastCalledWith('bar')

  state.bar = '2'
  await queueMacroTask()
  expect(fooEFnSpy).toHaveBeenLastCalledWith('foo~~~1')
  expect(barEFnSpy).toHaveBeenLastCalledWith('2')
})
