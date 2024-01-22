// export * from '@/reactive/_traps/convention/5-8.js'

import { warn } from '@/utils/index'

const REF_FLAG = '__v_isRef'
const REF__VALUE_KEY = '_value'
const REF__RAW = '_rawValue'
const REF__SHALLOW_FLAG = '__v_isShallow'
const REF_DEP = 'dep'

const REF_KEYS_SortedDef_STR = [
  REF_FLAG,
  REF__VALUE_KEY,
  REF__RAW,
  REF__SHALLOW_FLAG,
  REF_DEP
]
  .sort()
  .toString()

// warn(REF_KEYS_SortedDef_STR, 'REF_KEYS_STR')

function withRefFlag(wrapper, isShallow, isReadonly, version) {
  if (typeof wrapper !== 'object' || wrapper === null) return wrapper
  Object.defineProperty(wrapper, 'value', {
    get() {
      return wrapper[REF__VALUE_KEY]
    },
    set(v) {
      wrapper[REF__VALUE_KEY] = v
    }
  })
  Object.defineProperty(wrapper, REF_FLAG, {
    value: true,
    enumerable: true,
    writable: false,
    configurable: false
  })
  // NOTE: 临时
  Object.defineProperty(wrapper, REF__RAW, { enumerable: true })
  Object.defineProperty(wrapper, REF__SHALLOW_FLAG, { enumerable: true })
  Object.defineProperty(wrapper, REF_DEP, { enumerable: true })

  return wrapper
}

function isRef(ref) {
  const keysStr = ref ? Object.keys(ref).sort().toString() : ''
  const res = ref && ref[REF_FLAG] && keysStr === REF_KEYS_SortedDef_STR
  if (!res && keysStr) warn(keysStr, 'keysStr')
  return res
}

function toRef(o, key) {
  const wrapper = {
    get [REF__VALUE_KEY]() {
      return o[key]
    },
    set [REF__VALUE_KEY](v) {
      o[key] = v
    }
  }
  return withRefFlag(wrapper)
}

function toRefs(o) {
  const res = {}
  for (const key in o) {
    // if (Object.hasOwnProperty.call(o, key))
    res[key] = toRef(o, key)
  }
  return res
}

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      return isRef(res) ? res.value : res
    },
    set(target, key, value, receiver) {
      const res = target[key]
      if (isRef(res)) {
        res.value = value
        return true
      }
      return Reflect.set(target, key, value, receiver)
    }
  })
}

export { withRefFlag, isRef, toRef, toRefs, proxyRefs, REF__VALUE_KEY }
