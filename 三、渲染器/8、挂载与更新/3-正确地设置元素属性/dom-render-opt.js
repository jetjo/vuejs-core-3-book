
/**
 * @param {{window: Window}} arg0
 */
function createDOMOption({ window } = {}) {
  window = window || globalThis

  const { document } = window

  /**
   * @description 在指定环境运行的渲染器的配置
   * @type {import('#shims').RendererConfig}
   */
  const domOpt = {

    get window() {
      return window
    },

    get document() {
      return document
    },

    createElement: tag => {
      return document.createElement(tag)
    },
    insert: (child, parent, anchor) => {
      parent.insertBefore(child, anchor)
    },
    setElementText: (el, text) => {
      el.textContent = text
    },
    setAttribute: (el, key, value) => {
      el.setAttribute(key, value)
    },
    addEventListener: (el, event, handler) => {
      el.addEventListener(event.slice(2).toLowerCase(), handler)
    }
  }
  return domOpt
}

export { createDOMOption }
