import { reactive, ref, isRef } from 'vue'
import { describe, test, expect } from 'vitest'

describe('确认vue中,删除refs的属性,没有自动脱ref', () => {
  test('', () => {
    const raw = { foo: ref(1) }
    const state = reactive(raw)
    delete state.foo
    expect(Object.hasOwn(raw, 'foo')).toBe(false)
    // expect(Object.hasOwn(raw.foo, 'value')).toBe(false)
    expect(isRef(raw.foo)).toBe(false)
  })
})
