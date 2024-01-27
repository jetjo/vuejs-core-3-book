import { describe, test, expect, vi } from 'vitest'
import { REF__VALUE_KEY, toRefs } from './convention.sl.js'
import { createReactive } from '#reactive/5-8.js'
import { effect } from '#effect/4-11.js'
import { queueMacroTask } from '#utils'

const reactive = createReactive()()
const state = reactive({ foo: 1 })
const refs = { ...toRefs(state) }
const foo = refs.foo

const eFn = vi.fn((v, name) => (console.log(v, name), [v, name]))
effect(() => {
  eFn(refs.foo[REF__VALUE_KEY], 'foo')
})

test('toRefs', async () => {
  refs.foo[REF__VALUE_KEY] = 2
  await queueMacroTask()
  expect(eFn).toHaveLastReturnedWith([2, 'foo'])
  foo[REF__VALUE_KEY] = 8
  await queueMacroTask()
  expect(eFn).toHaveLastReturnedWith([8, 'foo'])
})
