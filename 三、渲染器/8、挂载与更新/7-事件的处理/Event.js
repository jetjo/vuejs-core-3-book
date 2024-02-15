import { requireCallable } from '#utils'

/**@type {import('#shims').Invoker} */
// @ts-ignore
const _Invoker = function (el, key, handler, onAdd, onRemove, inheritor) {
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

  /**@type {*} */
  const _inheritor = { __proto__: null }

  _inheritor.attached = on.attached = 0

  _inheritor.value = on.value = handler

  _inheritor.update = on.update = handler => {
    if (inheritor) inheritor.value = handler
    on.value = handler
  }

  _inheritor.remove = on.remove = () => {
    onRemove(on)
    if (inheritor) onRemove(inheritor)
    el._vei && (el._vei[key] = null)
  }

  if (inheritor) Object.assign(inheritor, _inheritor)

  onAdd((el._vei[key] = inheritor || on))
  return on
}

_Invoker.getInvoker = (el, key) => {
  const invokers = el._vei || (el._vei = {})
  return invokers[key]
}

export default _Invoker
