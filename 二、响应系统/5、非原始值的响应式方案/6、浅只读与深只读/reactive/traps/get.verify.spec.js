import { reactive, ref, isRef } from 'vue'
import { describe, test, expect } from 'vitest'

describe('确认vue中,读取refs的属性,有自动脱ref', () => {
  test('', () => {
    const raw = { foo: ref(1) }
    const state = reactive(raw)
    expect(state.foo).toBe(1)
    expect(isRef(raw.foo)).toBe(true)
  })
})
