// import { JSDOM } from 'jsdom'
// @ts-ignore
import { queueMacroTask, queueMicroTask, warn } from '#root/utils'

const VER = '8-1 jsdom'

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
async function createJsDomOption() {
  // const { window } = new JSDOM(createHTML(), {
  //   pretendToBeVisual: true
  // })

  // const { document } = window

  // @ts-ignore
  const requestAnimationFrame = async cb => {
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

  // // NOTE: 如果`body`已经包含`#app`的`container`了,
  // // 再重新赋值, 会导致之前`renderer`渲染时所使用的`container`被从页面卸载掉!!!
  // // if (document.body.innerHTML === '') {
  // // NOTE: 不知为何, `vitest`测试时, 这一句的执行时机被提升到了方法体外面
  // 并且,有时候执行了没有效果, body还是原来的内容
  // // 所以注释掉. 每个`test suit`需要清空`body`时,自行清空
  document.body.innerHTML = /* html */ `<div id="app"></div>`
  // // }

  // NOTE: 前面为`document.body.innerHTML`赋值后, 需要等待一段时间, 等`jsdom`渲染完毕???
  await requestAnimationFrame()
  // warn('jsdom~~~', document.body.innerHTML)

  return {
    version: VER,

    getContainer: function (css = '#app', apiVer = '') {
      const ele = document.querySelector(css)
      if (!ele) {
        // warn(`body: ${document.body.innerHTML}`)
        throw new Error(`未找到${css}元素`)
      }
      return ele
    },

    createElement: tag => {
      return document.createElement(tag)
    },
    insert: (child, parent, anchor = null) => {
      parent.insertBefore(child, anchor)
    },
    setElementText: (el, text) => {
      el.textContent = text
      return el
    },
    setAttribute: (el, key, value) => {
      el.setAttribute(key, value)
      return el
    },
    addEventListener: (el, event, handler) => {
      el.addEventListener(event.slice(2).toLowerCase(), handler)
      return el
    },
    patchEventProp: () => {
      throw new Error('Method not implemented.')
    },
    patchProps: () => {
      throw new Error('Method not implemented.')
    },
    createText: text => {
      throw new Error('Method not implemented.')
    },
    setText: () => {
      throw new Error('Method not implemented.')
    },
    createComment: () => {
      throw new Error('Method not implemented.')
    },
    setComment: () => {
      throw new Error('Method not implemented.')
    },
    requestAnimationFrame
  }
}

createJsDomOption.version = VER

export default createJsDomOption
