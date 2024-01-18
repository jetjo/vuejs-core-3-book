export * from '../../reactive/_traps/convention/5-8.js'

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

export { withRefFlag, isRef }
