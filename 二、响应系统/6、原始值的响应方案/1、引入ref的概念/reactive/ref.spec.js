import { describe, test, expect } from 'vitest'

import { createRef } from './ref.sl.js'
import { REF__VALUE_KEY } from './convention.sl.js'

describe('createRef', () => {
  test('should cache createRef result', () => {
    const ref = createRef()
    const ref2 = createRef()
    expect(ref).toBe(ref2)
  })

  test('ref call ', () => {
    const ref = createRef()
    expect(ref(1)).toHaveProperty(REF__VALUE_KEY, 1)
  })
})
