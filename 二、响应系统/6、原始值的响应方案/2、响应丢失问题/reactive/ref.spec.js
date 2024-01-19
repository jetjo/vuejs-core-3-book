import { describe, test, expect, vi } from 'vitest'
import { toRefs } from './convention.sl.js'
import { createReactive } from '@reactive/api/5-8.js'
import { effect } from '@effect/index/4-11.js'
import { queueMacroTask } from '@utils/index.js'

const reactive = createReactive()()
const state = reactive({ foo: 1 })
const refs = { ...toRefs(state) }
const foo = refs.foo

const eFn = vi.fn((v, name) => (console.log(v, name), [v, name]))
effect(() => {
  eFn(refs.foo.value, 'foo')
})

describe('toRefs', () => {
  test('', async () => {
    refs.foo.value = 2
    await queueMacroTask()
    expect(eFn).toHaveLastReturnedWith([2, 'foo'])
    foo.value = 8
    await queueMacroTask()
    expect(eFn).toHaveLastReturnedWith([8, 'foo'])
  })
})
