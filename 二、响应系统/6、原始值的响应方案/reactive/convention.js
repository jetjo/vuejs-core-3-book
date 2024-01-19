export * from '@reactive/_traps/convention/5-8.js'

const REF_FLAG = '__v_isRef'

function withRefFlag(wrapper) {
  if (typeof wrapper !== 'object' || wrapper === null) return wrapper
  Object.defineProperty(wrapper, REF_FLAG, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false
  })
  return wrapper
}

function isRef(ref) {
  return ref && ref[REF_FLAG] && Object.keys(ref).toString() === 'value'
}

function toRef(o, key) {
  const wrapper = {
    get value() {
      return o[key]
    },
    set value(v) {
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

export { withRefFlag, isRef, toRef, toRefs }
