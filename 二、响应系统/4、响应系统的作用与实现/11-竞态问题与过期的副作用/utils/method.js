import { warn } from './log.js'

const absImplMap = new WeakMap()
const absProxyMap = new WeakMap()

/**@description 取回与abs对应的impl */
function getAbstractMethodImpl(abs) {
  if (absProxyMap.has(abs)) {
    return absProxyMap.get(abs)
  }
  let impl
  const apply = (target, thisArg, argArray) => {
    if (!impl) {
      impl = absImplMap.get(abs)
      if (!impl) {
        warn('abs没有impl!')
      }
    }
    return Reflect.apply(impl || target, thisArg, argArray)
  }
  const proxy = new Proxy(abs, { apply })
  absProxyMap.set(abs, proxy)
  return proxy
}

/**@description 存储abs和impl的对应关系 */
function setAbstractMethodImpl(abs, impl) {
  if (absImplMap.has(abs)) {
    warn('已经注册过abs的impl!')
    return absImplMap.get(abs)
  }
  absImplMap.set(abs, impl)
  return impl
}

export { getAbstractMethodImpl, setAbstractMethodImpl }
