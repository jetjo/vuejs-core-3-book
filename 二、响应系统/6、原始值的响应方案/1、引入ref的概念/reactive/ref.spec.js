import { describe, test, expect } from 'vitest'

import createRef from './ref.sl.js'

describe('createRef', () => {
  test('should cache createRef result', () => {
    const ref = createRef()
    const ref2 = createRef()
    expect(ref).toBe(ref2)
  })

  test('ref call ', () => {
    const ref = createRef()
    expect(ref(1)).toHaveProperty('value', 1)
  })
})
