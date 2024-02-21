import { requireEventHandler } from '#utils'
import baseConfig from '../4-class的处理/render-opt-browser.js'
import Invoker from './Event.js'

/**@type {typeof baseConfig.patchProps} */
const patchProps = function (el, key, prevValue, nextValue) {
  if (key.startsWith('on')) {
    prevValue && requireEventHandler(prevValue)
    nextValue && requireEventHandler(nextValue)
    // @ts-ignore
    this.patchEventProp(el, key, prevValue, nextValue)
    return el
  }
  return baseConfig.patchProps(el, key, prevValue, nextValue)
}
patchProps.isElement = baseConfig.patchProps.isElement

/**@type {typeof baseConfig} */
const update = {
  ...baseConfig,
  version: '8-7 browser',
  Invoker,
  patchEventProp(el, key, preHandler, handler) {
    if (!this.Invoker) throw new Error('Invoker is not defined')
    let invoker = this.Invoker.getInvoker(el, key)
    if (handler) {
      if (!invoker) {
        const name = key.slice(2).toLowerCase()
        this.Invoker(
          el,
          key,
          handler,
          on => el.addEventListener(name, on),
          on => el.removeEventListener(name, on)
        )
        return el
      }
      invoker.update(handler)
      return el
    }
    invoker?.remove()
    return el
  },
  patchProps
}

export default update
