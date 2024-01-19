import { describe, test, expect } from 'vitest'
import { createRef } from './ref.sl.js'
import { isRef } from './convention.sl.js'

describe('ref convention', () => {
  const ref = createRef()
  test('isRef', () => {
    const state = ref(1)
    expect(isRef(state)).toBe(true)
  })
})
