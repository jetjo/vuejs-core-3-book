import { JSDOM } from 'jsdom'

function createHTML({ title }) {
  const html = /* html */`<!doctype html>
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

function createJsDomOption({ title, bodyHtml } = {}) {
  const { window } = new JSDOM(createHTML({ title }), {
    pretendToBeVisual: true
  })

  const { document } = window

  document.body.innerHTML = bodyHtml || /* html */`<div id="app"></div>`
  /**
   * @description 配置一个可以在jsdom环境运行的渲染器
   * @type {import('#shims').RendererConfig}
   */
  const forJSDOM = {
    get container() {
      return document.body.firstElementChild
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
    setElementAttribute: (el, key, value) => {
      el.setAttribute(key, value)
    },
    onElementEvent: (el, event, handler) => {
      el.addEventListener(event.slice(2).toLowerCase(), handler)
    }
  }
  return forJSDOM
}

export { createJsDomOption }
