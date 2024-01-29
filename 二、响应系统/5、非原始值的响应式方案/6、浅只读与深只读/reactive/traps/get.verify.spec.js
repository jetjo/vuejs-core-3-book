import { reactive, ref, isRef, watchEffect } from '#vue'
import { describe, test, expect, vi } from 'vitest'
import { queueMacroTask } from "#utils";

test('确认vue中,读取refs的属性,有自动脱ref', () => {
  const raw = { foo: ref(1) }
  const state = reactive(raw)
  expect(state.foo).toBe(1)
  expect(isRef(raw.foo)).toBe(true)
})

const fooRef = ref(1)
const state = reactive({ foo: fooRef })
const effectFn = vi.fn(() => {
  console.warn(state.foo, 'state.foo');
})
watchEffect(effectFn)

test('确认vue中,读取refs的属性,有收集value依赖', async () => {
  expect(effectFn).toBeCalledTimes(1)
  fooRef.value = 2
  expect(state.foo).toBe(2)
  await queueMacroTask()
  expect(effectFn).toBeCalledTimes(2)
})
