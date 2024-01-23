import { effect } from '#effect/4-11.js'
// import { createReactive } from './api.js'
// import { createReactive } from '#reactive/5-7.js'
import { createReactive } from '#reactive/5-8.js'
import { createRef } from '#ref/6-1.js'
import { isRef, toRef, toRefs } from '#ref-convention'
import { describe, test, expect, vi } from 'vitest'
import { log, queueMacroTask, warn } from '#utils'

const reactive = createReactive()()
const ref = createRef(reactive)

describe('ref自动脱ref后,仍然保持响应性', () => {
  const state = reactive({ foo: ref(1) })
  const eFnSpy = vi.fn(v => warn(v))
  effect(() => {
    eFnSpy(state.foo)
  })
  test('设置value', async () => {
    expect(eFnSpy).toHaveBeenLastCalledWith(1)
    state.foo = 2
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(2)
  })
  test('删除value', async () => {
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(2)
    delete state.foo
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(undefined)
  })
})

describe('toRef自动脱ref后,仍然保持响应性', () => {
  const _state = reactive({ foo: 1 })
  const state = reactive({ foo: toRef(_state, 'foo') })
  const eFnSpy = vi.fn(v => warn(v))
  effect(() => {
    eFnSpy(state.foo)
  })
  test('设置value', async () => {
    expect(eFnSpy).toHaveBeenLastCalledWith(1)
    state.foo = 2
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(2)
  })
  test('删除value', async () => {
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(2)
    delete state.foo
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(undefined)
  })
})

describe('toRefs自动脱ref后,仍然保持响应性', () => {
  const _state = reactive({ foo: 1 })
  const state = reactive({ ...toRefs(_state) })
  const eFnSpy = vi.fn(v => warn(v))
  effect(() => {
    eFnSpy(state.foo)
  })
  test('设置value', async () => {
    expect(eFnSpy).toHaveBeenLastCalledWith(1)
    state.foo = 2
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(2)
  })
  test('删除value', async () => {
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(2)
    delete state.foo
    await queueMacroTask()
    expect(eFnSpy).toHaveBeenLastCalledWith(undefined)
  })
})
