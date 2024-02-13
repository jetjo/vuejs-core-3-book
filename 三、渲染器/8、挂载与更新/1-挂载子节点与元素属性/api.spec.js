// import { JSDOM } from 'jsdom'
import { describe, it, expect } from 'vitest'
import { defArg0 } from '#root/utils'
import creatorFactory from './api.js'
import createJsDomOption from './render-opt-jsdom.js'

/**
 * @param {import('#shims').RendererConfigCreator } createOption
 * @param {import('#shims').RendererCreatorFactory} creatorFactory
 * @param {string} [suitName='']
 * @returns {{config?: ReturnType<import('#shims').RendererConfigCreator>, render?: ReturnType<ReturnType<import('#shims').RendererCreatorFactory> >['render']}}
 */
function _test(createOption, creatorFactory, suitName = '') {
  // @ts-ignore
  const createRenderer = creatorFactory()

  // it('导入jsdom,可以正常工作 ', () => {
  //   const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`)
  //   expect(dom.window.document.querySelector('p')?.textContent).toBe(
  //     'Hello world'
  //   )
  // })

  const config = createOption()

  const { requestAnimationFrame: rAF } = config

  it('正确创建了页面', async () => {
    await rAF()

    expect(document.title).toBe('jsdom')
    expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
  })

  it('正确渲染了节点', async () => {
    await rAF()

    const container = config.getContainer && config.getContainer()
    // @ts-ignore
    const { render: _render, version } = createRenderer(config)
    // console.error(version, 'version');
    // render = _render
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
    _render(vnode, container)
    await rAF()
    expect(container?.innerHTML).toBe(
      /* html */ `<div id="foo"><p>Hello World</p></div>`
    )
  })

  return {
    config
    // render // it回调中的render还未返回
  }
}

/**@type {typeof _test} */
export const test = (
  createOption,
  creatorFactory,
  suitName = '挂载子节点与元素属性'
) => {
  // test(createJsDomOption, creatorFactory)

  const config = createOption()
  if (!config.getContainer) throw new Error('config.getContainer is not defined') // prettier-ignore
  const container = config.getContainer()
  if (!container) throw new Error('container is not exist')

  const { requestAnimationFrame: rAF } = config

  const { render } = creatorFactory(defArg0)(config)

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

  describe(suitName, () => {
    it('正确创建了页面', async () => {
      await rAF()
      expect(document.title).toBe('jsdom')
      expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
    })

    it('正确渲染了节点', async () => {
      await rAF()
      render(vnode, container)
      await rAF()
      expect(container?.innerHTML).toBe(
        /* html */ `<div id="foo"><p>Hello World</p></div>`
      )
    })
  })
  return {
    config,
    render // it回调中的render还未返回
  }
}

describe.skip('挂载子节点与元素属性-skip', () => {})

test(createJsDomOption, creatorFactory)
