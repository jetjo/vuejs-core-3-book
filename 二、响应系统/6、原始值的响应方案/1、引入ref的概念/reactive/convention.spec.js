import { describe, test, expect } from 'vitest'
import createRef from './ref.js'
import { isRef } from './convention.js'

describe('ref convention', () => {
  const ref = createRef()
  test('isRef', () => {
    const state = ref(1)
    expect(isRef(state)).toBe(true)
  })
})
