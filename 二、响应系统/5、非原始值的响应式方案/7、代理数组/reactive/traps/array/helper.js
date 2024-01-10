function withAllPropertySetTo(o, { configurable, enumerable, writeable }) {
  const descriptors = Object.getOwnPropertyDescriptors(o)
  delete descriptors.constructor
  for (const [key, desc] of Object.entries(descriptors)) {
    if (!desc.configurable) continue
    desc.enumerable = enumerable
    desc.configurable = configurable
    if (desc.writable !== undefined) desc.writable = writeable
    Object.defineProperty(o, key, desc)
  }
  return o
}
function withAllPropertyEnumerable(o) {
  const descriptors = Object.getOwnPropertyDescriptors(o)
  delete descriptors.constructor
  for (const [key, desc] of Object.entries(descriptors)) {
    if (!desc.configurable) continue
    desc.enumerable = true
    Object.defineProperty(o, key, desc)
  }
  return o
}

export { withAllPropertyEnumerable }
