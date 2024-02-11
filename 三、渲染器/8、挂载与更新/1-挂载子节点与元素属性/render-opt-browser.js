import { defArg0 } from '#root/utils'

/**@type {import('#shims').RendererConfigCreator} */
function createRenderOption({ window } = defArg0) {
  window ||= globalThis

  const { document } = window

  return {
    getContainer: (selector = '#app') => {
      return document.querySelector(selector)
    },

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
    },
    patchProps: () => {
      throw new Error('patchProps is not implemented')
    }
  }
}

export default createRenderOption
