import { JSDOM } from 'jsdom'

/**
 * @param {object} [arg]
 * @param {string} [arg.title]
 */
function createHTML({ title } = {}) {
  const html = /* html */ `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title || 'jsdom'}</title>
      </head>
      <body></body>
    </html>`
  return html
}

/**@type {import('#shims').RendererConfigCreator} */
function createJsDomOption() {
  const { window } = new JSDOM(createHTML(), {
    pretendToBeVisual: true
  })

  const { document } = window

  document.body.innerHTML = /* html */ `<div id="app"></div>`

  return {
    getContainer: function (css = '#app') {
      return document.querySelector(css)
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
      throw new Error('Method not implemented.')
    },
    requestAnimationFrame: cb => {
      return window.requestAnimationFrame(cb)
    }
  }
}

export default createJsDomOption
