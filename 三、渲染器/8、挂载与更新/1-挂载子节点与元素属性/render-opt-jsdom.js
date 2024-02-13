// import { JSDOM } from 'jsdom'
// @ts-ignore
import { queueMacroTask, queueMicroTask } from '#root/utils'

/**
 * @param {object} [arg]
 * @param {string} [arg.title]
 */
// @ts-ignore
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
  // const { window } = new JSDOM(createHTML(), {
  //   pretendToBeVisual: true
  // })

  // const { document } = window

  document.body.innerHTML = /* html */ `<div id="app"></div>`

  return {
    getContainer: function (css = '#app') {
      return document.querySelector(css)
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
    requestAnimationFrame: async cb => {
      // @ts-ignore
      // const handler = window.requestAnimationFrame(cb)
      // setTimeout(() => {
      //   window.cancelAnimationFrame(handler)
      // }, 3000)
      // await queueMicroTask()
      const timestamp = await new Promise(resolve => {
        window.requestAnimationFrame(timestamp => resolve(timestamp))
      })
      cb && cb(timestamp)
      return timestamp
      // return handler
      // return queueMacroTask(cb)
      // await queueMacroTask()
      // cb && cb(performance.now())
      // return 0
    }
  }
}

export default createJsDomOption
