import { describe, test, expect, vi } from 'vitest'
import { createReactive } from '@/reactive/api/5-8.js'
import { proxyRefs, toRefs } from './convention.sl'
import { log, queueMacroTask, warn } from '@/utils/index'
import { effect } from '@/effect/index/4-11'

const reactive = createReactive()()

const _state = reactive({ foo: 'foo', bar: 'bar' })

const state = proxyRefs(toRefs(_state))

const fooEFnSpy = vi.fn(v => warn(v, 'foo'))
const barEFnSpy = vi.fn(v => warn(v, 'bar'))

effect(() => {
  fooEFnSpy(state.foo)
  barEFnSpy(state.bar)
})

describe('自动脱ref后, 仍能正常收集依赖并触发副作用', () => {
  test('', async () => {
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
})
