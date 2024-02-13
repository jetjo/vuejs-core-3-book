/**@type {import('#shims').RendererConfigCreator} */
function createRenderOption() {
  return {
    getContainer: (selector = '#app') => {
      return document.querySelector(selector)
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
    patchProps: (el, key, pre, next) => {
      throw new Error('patchProps is not implemented')
    },
    requestAnimationFrame: async cb => {
      const timestamp = await new Promise(resolve => {
        window.requestAnimationFrame(timestamp => resolve(timestamp))
      })
      cb && cb(timestamp)
      return timestamp
    }
  }
}

export default createRenderOption
