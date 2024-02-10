import { it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { createRenderer } from './api.js'
import { createJsDomOption } from './render-config.js'

it('导入jsdom,可以正常工作 ', () => {
  const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
  expect(dom.window.document.querySelector('p').textContent).toBe('Hello world')
})

const config = createJsDomOption({})

const { window, document, ...renderOption } = config

it('正确创建了页面', async () => {
  await new Promise(resolve => {
    window.requestAnimationFrame(() => resolve())
  })

  expect(document.title).toBe('jsdom')
  expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
})

it('正确渲染了节点', async () => {
  await new Promise(resolve => {
    window.requestAnimationFrame(() => resolve())
  })
  const container = config.getContainer()
  const { render } = createRenderer(renderOption)
  const vnode = {
    type: 'div',
    props: {
      id: 'foo'
    },
    children: [
      {
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
    window.requestAnimationFrame(() => resolve())
  })
  expect(container.innerHTML).toBe(
    /* html */ `<div id="foo"><p>Hello World</p></div>`
  )
})
