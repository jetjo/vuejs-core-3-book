import { describe, test, expect } from 'vitest'
import { ref, shallowReadonlyRef } from '@jetjo/vue3/ref'
import { shallowReadonlyReactive } from '@jetjo/vue3/reactive'
import { toRefs } from '@jetjo/vue3/ref-utils'
import { proxyRefs } from '#ref/convention.js'
import { REF__VALUE_KEY } from './convention.sl.js'
import {
  SHALLOW_REACTIVE_FLAG,
  READONLY_REACTIVE_FLAG,
  VERSION_FLAG,
  getRaw
} from '#reactive-convention/4-11.js'

describe('ref flags test', () => {
  test('ref ', () => {
    const { isShallow, isReadonly, version } = ref
    expect(isShallow).toBe(false)
    expect(isReadonly).toBe(false)
    expect(version).toBe('6-1')
  })

  test('ref result', () => {
    const { isShallow, isReadonly, version } = ref(1)
    expect(isShallow).toBe(false)
    expect(isReadonly).toBe(false)
    expect(version).toBe('6-1')
  })

  test('ref result.value', () => {
    const {
      [SHALLOW_REACTIVE_FLAG]: isShallow,
      [READONLY_REACTIVE_FLAG]: isReadonly,
      [VERSION_FLAG]: version
    } = ref({}).value
    expect(isShallow).toBe(false)
    expect(isReadonly).toBe(false)
    expect(version).toBe('5-7')
  })
})
describe('shallowReadonlyRef flags test', () => {
  test('shallowReadonlyRef ', () => {
    const { isShallow, isReadonly, version } = shallowReadonlyRef
    expect(isShallow).toBe(true)
    expect(isReadonly).toBe(true)
    expect(version).toBe('6-1')
  })

  test('shallowReadonlyRef result', () => {
    const { isShallow, isReadonly, version } = shallowReadonlyRef(1)
    expect(isShallow).toBe(true)
    expect(isReadonly).toBe(true)
    expect(version).toBe('6-1')
  })

  test('shallowReadonlyRef result.value', () => {
    const {
      [SHALLOW_REACTIVE_FLAG]: isShallow,
      [READONLY_REACTIVE_FLAG]: isReadonly,
      [VERSION_FLAG]: versionProxy,
      version
    } = shallowReadonlyRef({}) //.value
    expect(isShallow).toBe(true)
    expect(isReadonly).toBe(true)
    expect(versionProxy).toBe('5-7')
    expect(version).toBe('6-1')
  })
})

describe('shallowReadonlyReactive flags test', () => {
  test('shallowReadonlyReactive flags', () => {
    const { isShallow, isReadonly, version } = shallowReadonlyReactive
    expect(isShallow).toBe(true)
    expect(isReadonly).toBe(true)
    expect(version).toBe('5-8')
  })
  const _state = shallowReadonlyReactive({ a: 1, b: 2, value: {} })
  test('shallowReadonlyReactive result', () => {
    const {
      [SHALLOW_REACTIVE_FLAG]: isShallow,
      [READONLY_REACTIVE_FLAG]: isReadonly,
      [VERSION_FLAG]: version
    } = _state
    expect(isShallow).toBe(true)
    expect(isReadonly).toBe(true)
    expect(version).toBe('5-7')
  })
  test('shallowReadonlyReactive result.value', () => {
    const {
      [SHALLOW_REACTIVE_FLAG]: isShallow,
      [READONLY_REACTIVE_FLAG]: isReadonly,
      [VERSION_FLAG]: version
    } = _state.value
    expect(isShallow).toBe(undefined)
    expect(isReadonly).toBe(undefined)
    expect(version).toBe(undefined)
  })
})

describe('toRefs flags test', () => {
  test('toRefs result', () => {
    const _state = shallowReadonlyReactive({ a: 1, b: 2 })
    const { isShallow, isReadonly, version } = toRefs(_state)
    expect(isShallow).toBe(true)
    expect(isReadonly).toBe(true)
    expect(version).toBe('5-7')

    const { a, b } = toRefs(_state)
    expect(a.isShallow).toBe(true)
    expect(a.isReadonly).toBe(true)
    expect(a.version).toBe('5-7')
    expect(a.value).toBe(1)

    const refs = toRefs(_state)
    expect(refs.a.isShallow).toBe(true)
    expect(refs.a.isReadonly).toBe(true)
    expect(refs.a.version).toBe('5-7')
    expect(refs.a.value).toBe(1)

    const refsProxy = proxyRefs(refs)
    expect(refsProxy.a.isShallow).toBe(undefined)
    expect(refsProxy.a.isReadonly).toBe(undefined)
    expect(refsProxy.a.version).toBe(undefined)
    expect(refsProxy.a).toBe(1)
  })
})
