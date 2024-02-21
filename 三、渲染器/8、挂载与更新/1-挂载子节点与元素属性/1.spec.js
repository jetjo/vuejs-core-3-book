import { describe, it, expect } from 'vitest'
import factory from './t.js'
import option from './render-opt-jsdom.js'
import { getApi, isLatestVer } from '../../utils/test.helper.js'

/**
 * @template ET
 * @template {ET} HN
 * @template {HN} Ele
 * @template {HN} ParentN
 * @template {Ele} EleNS
 * @template {HN} Doc
 * @param {import('#shims').RendererConfig} option
 * @param {import('#shims').RendererFactory<ET, HN, Ele, ParentN, EleNS, Doc>} factory
 * @returns {void}
 */
export const test = (option, factory) => {
  describe('1-挂载子节点与元素属性', async () => {
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
          ...option.defVNode,
          el: null,
          type: 'p',
          props: {},
          //  <div id="foo"><p><text text="Hello World"></text></p></div>
          // children: [{ type: 'TEXT', props: { text: 'Hello World' } }]
          children: 'Hello World'
        }
      ]
    }

    it(`正确创建了页面`, async () => {
      // prettier-ignore
      const { rAF } = await getApi(option, factory, '挂载子节点与元素属性', '正确创建了页面')
      document.body.innerHTML = /* html */ `<div id="app"></div>`
      await rAF()
      expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
    })

    it(`正确渲染了节点`, async () => {
      // prettier-ignore
      const { render, rAF, config } = await getApi(option, factory, '挂载子节点与元素属性', '正确渲染了节点')
      document.body.innerHTML = /* html */ `<div id="app"></div>`
      await rAF()
      render(vnode, config.getContainer())
      await rAF()
      expect(config.getContainer().innerHTML).toBe(
        /* html */ `<div id="foo"><p>Hello World</p></div>`
      )
    })
  })
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
