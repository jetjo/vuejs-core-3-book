import baseCreate from '../7-事件的处理/render-opt-browser.js'
import Invoker from './Event.js'

const VER = '8-8 browser'
/**@type {import('#shims').RendererConfigCreator} */
async function createDOMOption() {
  /**@type {import('#shims').RendererConfig} */
  const domOpt = await baseCreate()

  domOpt.Invoker = Invoker

  return Object.assign(domOpt, { version: VER })
}
createDOMOption.version = VER
createDOMOption.defVNode = baseCreate.defVNode
export default createDOMOption
