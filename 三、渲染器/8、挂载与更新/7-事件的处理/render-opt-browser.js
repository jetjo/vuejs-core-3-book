import { requireCallable, requireEventHandler } from '#utils'
import baseCreate from '../4-class的处理/render-opt-browser.js'
import Invoker from './Event.js'

function createDOMOption() {
  /**@type {import('#shims').RendererConfig} */
  const domOpt = baseCreate()

  const basePatch = domOpt.patchProps

  domOpt.patchEventProp = (el, key, preHandler, handler) => {
    let invoker = Invoker.getInvoker(el, key)
    if (handler) {
      if (!invoker) {
        const name = key.slice(2).toLowerCase()
        // @ts-ignore
        const add = on => el.addEventListener(name, on)
        // @ts-ignore
        const remove = on => el.removeEventListener(name, on)

        Invoker(el, key, handler, add, remove)
        return el
      }
      invoker.update(handler)
      return el
    }
    invoker?.remove()
    return el
  }

  domOpt.patchProps = (el, key, prevValue, nextValue) => {
    if (key.startsWith('on')) {
      prevValue && requireEventHandler(prevValue)
      nextValue && requireEventHandler(nextValue)
      // @ts-ignore
      return domOpt.patchEventProp(el, key, prevValue, nextValue)
    }
    return basePatch(el, key, prevValue, nextValue)
  }

  return domOpt
}

export default createDOMOption
