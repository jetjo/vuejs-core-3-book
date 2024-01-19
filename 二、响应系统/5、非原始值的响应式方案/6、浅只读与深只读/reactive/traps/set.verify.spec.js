import { reactive, ref, isRef } from 'vue'
import { describe, test, expect } from 'vitest'

describe('确认vue中,设置refs的属性,有自动脱ref', () => {
  test('', () => {
    const raw = { foo: ref(1) }
    const state = reactive(raw)
    state.foo = 2
    expect(state.foo).toBe(2)
    expect(isRef(raw.foo)).toBe(true)
  })
})
