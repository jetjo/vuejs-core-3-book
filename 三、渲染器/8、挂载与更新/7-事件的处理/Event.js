import { requireCallable } from '#utils'

/**@type {import('#shims').Invoker} */
const _Invoker = function (el, key, handler, onAdd, onRemove) {
  if (!el._vei) throw new Error('el._vei is not defined')
  /**@type {EventListenerOrEventListenerObjectC} */
  const on = e => {
    if (!el._vei) throw new Error('el._vei is not defined')
    const invoker = el._vei[key]
    if (!invoker || !invoker.value) throw new Error('invoker is not defined')
    if (Array.isArray(invoker.value)) {
      for (const cb of invoker.value) {
        requireCallable(cb)
        cb(e)
      }
      return
    }
    requireCallable(invoker.value)
    invoker.value(e)
  }
  on.value = handler

  on.update = handler => {
    on.value = handler
  }

  on.remove = () => {
    onRemove(on)
    el._vei && (el._vei[key] = null)
  }

  onAdd((el._vei[key] = on))
  return on
}

_Invoker.getInvoker = (el, key) => {
  const invokers = el._vei || (el._vei = {})
  return invokers[key]
}

export default _Invoker
