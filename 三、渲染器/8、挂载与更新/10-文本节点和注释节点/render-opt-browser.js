import baseCreate from '../8-事件冒泡与更新时机问题/render-opt-browser.js'

const VER = '8-10 browser'
/**@type {import('#shims').RendererConfigCreator} */
async function createDOMOption() {
  /**@type {import('#shims').RendererConfig} */
  const domOpt = await baseCreate()

  domOpt.createText = (text) => {
    return document.createTextNode(text)
  }
  domOpt.createComment = (text) => {
    return document.createComment(text)
  }
  domOpt.setText = (node, text) => {
    node.nodeValue = text
    return node
  }
  domOpt.setComment = domOpt.setText

  return Object.assign(domOpt, { version: VER })
}
createDOMOption.version = VER
createDOMOption.defVNode = baseCreate.defVNode
export default createDOMOption
