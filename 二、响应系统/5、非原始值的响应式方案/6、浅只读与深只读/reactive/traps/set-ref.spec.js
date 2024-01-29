import { reactive } from '@jetjo/vue3/reactive'
import { ref } from '@jetjo/vue3/ref'
import { isRef } from '@jetjo/vue3/ref-utils'
import { effect } from '@jetjo/vue3/effect'
import { describe, test, expect, vi } from 'vitest'
import { queueMacroTask } from '#utils'

test('设置refs的属性,有自动脱ref', () => {
  const raw = { foo: ref(1) }
  const state = reactive(raw)
  state.foo = 2
  expect(state.foo).toBe(2)
  expect(isRef(raw.foo)).toBe(true)
})

const fooRef = ref(1)
const state = reactive({ foo: fooRef })
const effectFn = vi.fn(() => {
  console.warn(fooRef.value, 'fooRef.value')
  // console.warn(state.foo, 'state.foo')
})
effect(effectFn)

test('设置refs的属性,有触发value依赖', async () => {
  expect(effectFn).toBeCalledTimes(1)
  state.foo = 2
  expect(fooRef.value).toBe(2)
  await queueMacroTask()
  expect(effectFn).toBeCalledTimes(2)
})
