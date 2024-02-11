import { it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import creatorFactory from './api.js'
import createJsDomOption from './render-opt-jsdom.js'

// @ts-ignore
const createRenderer = creatorFactory()

it('导入jsdom,可以正常工作 ', () => {
  const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
  expect(dom.window.document.querySelector('p')?.textContent).toBe(
    'Hello world'
  )
})

const config = createJsDomOption({})

const { document, requestAnimationFrame: rAF } = config

it('正确创建了页面', async () => {
  await new Promise(resolve => {
    rAF && rAF(() => resolve(void 0))
  })

  expect(document.title).toBe('jsdom')
  expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
})

it('正确渲染了节点', async () => {
  await new Promise(resolve => {
    rAF && rAF(() => resolve(void 0))
  })
  const container = config.getContainer && config.getContainer()
  const { render } = createRenderer(config)
  /**@type {VVNode<Node, Element>} */
  // @ts-ignore
  const vnode = {
    el: null,
    type: 'div',
    props: {
      id: 'foo'
    },
    children: [
      {
        el: null,
        type: 'p',
        props: {},
        //  <div id="foo"><p><text text="Hello World"></text></p></div>
        // children: [{ type: 'TEXT', props: { text: 'Hello World' } }]
        children: 'Hello World'
      }
    ]
  }
  render(vnode, container)
  await new Promise(resolve => {
    rAF && rAF(() => resolve(void 0))
  })
  expect(container?.innerHTML).toBe(
    /* html */ `<div id="foo"><p>Hello World</p></div>`
  )
})
