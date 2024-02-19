import { describe, it, expect } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from './render-opt-jsdom.js'
import { getApi, isLatestVer } from '../../utils/test.helper.js'

/**
 * @param {import('#shims').RendererConfigCreator } createOption
 * @param {import('#shims').RendererCreatorFactory} creatorFactory
 * @returns {void}
 */
export const test = (createOption, creatorFactory) => {
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
          ...createOption.defVNode,
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
      const { rAF } = await getApi(createOption, creatorFactory, '挂载子节点与元素属性', '正确创建了页面')
      document.body.innerHTML = /* html */ `<div id="app"></div>`
      await rAF()
      expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
    })

    it(`正确渲染了节点`, async () => {
      // prettier-ignore
      const { render, rAF, config } = await getApi(createOption, creatorFactory, '挂载子节点与元素属性', '正确渲染了节点')
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

if (await isLatestVer(createJsDomOption, creatorFactory)) {
  test(createJsDomOption, creatorFactory)
}
