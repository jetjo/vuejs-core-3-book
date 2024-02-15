import { requireCallable } from '#utils'
import InvokerBase from '../7-事件的处理/Event.js'

/**@type {import('#shims').Invoker} */
const _Invoker = function (el, key, handler, onAdd, onRemove) {
  if (!el._vei) throw new Error('el._vei is not defined')

  
  /**@type {EventListenerOrEventListenerObjectC} */
  // @ts-ignore
  const on = e => {
    if (on.attached > e.timeStamp) return
    requireCallable(baseOn)
    baseOn(e)
  }

  const baseOn = InvokerBase(el, key, handler, onAdd, onRemove, on)

  on.update = handler => {
    on.value = handler
    on.attached = performance.now()
    baseOn.value = handler
    baseOn.attached = performance.now()
  }

  on.attached = performance.now()
  baseOn.attached = performance.now()
  return on
}

_Invoker.getInvoker = InvokerBase.getInvoker

export default _Invoker
