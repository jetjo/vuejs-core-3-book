import { ref as v_ref, isRef as v_isRef } from 'vue'
import { describe, test, expect } from 'vitest'
import { createReactive } from '@reactive/api/5-6.js'
import { createRef } from '@reactive/ref/6-1.js'
import { isRef } from '@reactive/ref/convention.js'

const reactive = createReactive()()
const ref = createRef()

describe('读取refs的属性,有自动脱ref', () => {
  test('v_ref, v_isRef', () => {
    const raw = { foo: v_ref(1) }
    const state = reactive(raw)
    state.foo = 2
    expect(state.foo).toBe(2)
    expect(v_isRef(raw.foo)).toBe(true)
  })
  test('v_ref, isRef', () => {
    const raw = { foo: v_ref(1) }
    const state = reactive(raw)
    state.foo = 2
    expect(state.foo).toBe(2)
    expect(isRef(raw.foo)).toBe(true)
  })
  test('ref, v_isRef', () => {
    const raw = { foo: ref(1) }
    const state = reactive(raw)
    state.foo = 2
    expect(state.foo).toBe(2)
    expect(v_isRef(raw.foo)).toBe(true)
  })
  test('ref, isRef', () => {
    const raw = { foo: ref(1) }
    const state = reactive(raw)
    state.foo = 2
    expect(state.foo).toBe(2)
    expect(isRef(raw.foo)).toBe(true)
  })
})
