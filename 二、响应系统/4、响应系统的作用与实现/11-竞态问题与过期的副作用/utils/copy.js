function assignOwnDescriptors(target, ...sources) {
  if (typeof target !== 'object') throw new TypeError('target必须是对象!')
  if (!Object.isExtensible(target)) throw new TypeError('target必须是可扩展的!')
  sources.forEach(source => {
    if (typeof source !== 'object') return
    Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))
  })
}

function assignOwnDescriptorsWithProto(o) {
  return Object.create(
    Object.getPrototypeOf(o),
    Object.getOwnPropertyDescriptors(o)
  )
}

export { assignOwnDescriptors }
