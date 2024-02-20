import { warn } from '#root/utils'
import { requireEventHandler } from '#utils'
import baseCreate from '../4-class的处理/render-opt-browser.js'
import Invoker from './Event.js'

const VER = '8-7 browser'
/**@type {import('#shims').RendererConfigCreator} */
async function createDOMOption() {
  /**@type {import('#shims').RendererConfig} */
  const domOpt = await baseCreate()

  const basePatch = domOpt.patchProps

  domOpt.Invoker = Invoker

  domOpt.patchEventProp = (el, key, preHandler, handler) => {
    if (!domOpt.Invoker) throw new Error('Invoker is not defined')
    let invoker = domOpt.Invoker.getInvoker(el, key)
    if (handler) {
      if (!invoker) {
        const name = key.slice(2).toLowerCase()
        // @ts-ignore
        const add = on => el.addEventListener(name, on)
        // @ts-ignore
        const remove = on => el.removeEventListener(name, on)

        domOpt.Invoker(el, key, handler, add, remove)
        return el
      }
      invoker.update(handler)
      return el
    }
    invoker?.remove()
    return el
  }

  domOpt.patchProps = function (el, key, prevValue, nextValue) {
    // warn('patch', VER, 'patchProps', key, nextValue, arguments[4])
    if (key.startsWith('on')) {
      prevValue && requireEventHandler(prevValue)
      nextValue && requireEventHandler(nextValue)
      // @ts-ignore
      domOpt.patchEventProp(el, key, prevValue, nextValue)
      return el
    }
    return basePatch(el, key, prevValue, nextValue)
  }
  domOpt.patchProps.isElement = basePatch.isElement

  return Object.assign(domOpt, { version: VER })
}
createDOMOption.version = VER
createDOMOption.defVNode = baseCreate.defVNode
export default createDOMOption
