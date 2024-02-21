import baseConfig from '../8-事件冒泡与更新时机问题/render-opt-browser.js'

/**@type {typeof baseConfig} */
const update = {
  ...baseConfig,
  version: '8-10 browser',
  createText: text => {
    return document.createTextNode(text)
  },
  createComment: text => {
    return document.createComment(text)
  },
  setText: (node, text) => {
    node.nodeValue = text
    return node
  },
  setComment: (node, text) => {
    node.nodeValue = text
    return node
  }
}

export default update
