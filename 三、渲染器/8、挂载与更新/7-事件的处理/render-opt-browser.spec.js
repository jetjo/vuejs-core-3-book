/**
 * @param {((vnode: VVNode<Node, Element, {[key: string]: any;}> | null, container: Element | null | undefined) => void) & {config?: import("#shims").RendererCreatorFactoryConfig<Node, Element, {[key: string]: any;}> | undefined;}} render
 * @param {import("#shims").RendererConfig<EventTarget, Node, Element, ParentNode, HTMLElement, Document, typeof globalThis | Window | import("#shims").JSDOMWindow>} config
 */
function fixRenderForTest(render, config) {
  // @ts-ignore
  function patchElement(n1, n2) {
    const el = (n2.el = n1.el)
    const oldProps = n1.props
    const newProps = n2.props

    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        config.patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        config.patchProps(el, key, oldProps[key], null)
      }
    }
  }

  const patch = render.config?.patch
  if (!render.config || !patch) throw new Error('patch is not defined')

  render.config.patch = (n1, n2, container) => {
    if (n1 && n2 && n1.type === n2.type && typeof n2.type === 'string') {
      patchElement(n1, n2)
      log('patchElement')
      return
    }
    patch(n1, n2, container)
    log('mountElement')
  }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import creatorFactory from '../6-区分vnode类型/api.js'
import createJsDomOption from './render-opt-browser.js'
import { test as baseTest } from '../5-卸载操作/api.spec.js'
import { defArg0, log, warn } from '#root/utils'

/**@type {typeof baseTest} */
export const test = (createOption, creatorFactory, suitName = '7-事件处理') => {
  const { config: _config, render: _render } = baseTest(
    createOption,
    creatorFactory,
    `${suitName} - inherit`
  )
  const config = _config || createOption()
  if (!config) throw new Error('config is not defined')
  if (!config.getContainer) throw new Error('config.getContainer is not defined') // prettier-ignore

  const container = config.getContainer()
  const { requestAnimationFrame: rAF } = config

  const render = _render || (creatorFactory(defArg0)(config) || {})['render']
  if (!render) throw new Error('render is not defined')

  fixRenderForTest(render, config)

  function test() {
    if (!container) throw new Error('container not found')
    // window.requestAnimationFrame(() => {
    render(vnodeRemove, container)
    warn('remove')
    const h = (/** @type {Event} */ e) => {
      if (e.target !== e.currentTarget || e.target !== document) return
      handlerSpy()
      vnode.props[attrForTest] = `再次绑定了${eventName}事件`
      render(vnode, container)
      warn('update')
      document.removeEventListener('click', h)
    }
    document.addEventListener('click', h)
    // })
  }

  let clickCounter = 0

  const handlerSpy = vi.fn()
  const eventKey = 'onClick'
  const eventName = eventKey.slice(2).toLowerCase()
  const nodeType = 'p'
  const attrForTest = 'testName'

  /**@type {*} */
  const vnodeRemove = {
    type: 'p',
    props: {
      onClick: null,
      [attrForTest]: `移除了${eventName}事件`
    },
    children: 'text'
  }

  /**@type {*} */
  const vnode = {
    type: nodeType,
    props: {
      [eventKey]: [
        (/** @type {Event} */ e) => {
          /**@type {Element | null} */ // @ts-ignore
          const target = e.target
          if (e.target !== e.currentTarget || !target) return
          target.textContent = `clicked ${++clickCounter}`
          handlerSpy()
        },
        () => {
          setTimeout(() => {
            test() // alert('clicked 2')
            handlerSpy()
          }, 1000)
        }
      ],
      [attrForTest]: `绑定了${eventName}事件`
    },
    children: 'text'
  }

  describe(suitName, () => {
    beforeEach(() => {
      vi.useFakeTimers({
        loopLimit: 100,
        // shouldAdvanceTime: true,
        // NOTE: 不指定的话, 在调用`window.requestAnimationFrame`时会完全阻塞, 造成超时
        toFake: ['setTimeout', 'clearTimeout']
        // advanceTime: 1000,
      })
    })

    afterEach(() => {
      // 两个方法都能清除一个spy上的调用记录
      // 但是reset会将mock赋值为vi.fn(() => {})
      // vi.resetAllMocks();
      vi.clearAllMocks()
      vi.useRealTimers()
    })

    const getEle = () => {
      const ele = document.querySelector(nodeType)
      if (!ele) throw new Error('p not found')
      return ele
    }

    it('正确绑定事件', async () => {
      render(vnode, container)
      await rAF()
      const p = getEle()
      p.dispatchEvent(new Event(eventName))
      expect(p.getAttribute(attrForTest)).toBe(`绑定了${eventName}事件`)
      expect(clickCounter).toBe(1)
      expect(p.textContent).toBe(`clicked ${clickCounter}`)
      expect(handlerSpy).toHaveBeenCalledTimes(1)
      // 当前被阻塞的计时器的回调会影响下一个测试, 所以在最后要放行, 否则计时器会被清理, 其回调不会执行到
      vi.runAllTimers()
    })

    it('正确卸载事件', async () => {
      await rAF() // 上次测试最后触发了节点的更新, 所以需要等待
      // vi.runAllTimers()
      expect(handlerSpy).toHaveBeenCalledTimes(0)
      const p = getEle()
      expect(p.getAttribute(attrForTest)).toBe(`移除了${eventName}事件`)
      // 当前章节的版本,未实现对`vnode.child`的更新, 所以`p.textContent`还是`clicked 1`
      // expect(p.textContent).toBe(`clicked ${clickCounter}`)
      p.dispatchEvent(new Event(eventName))
      expect(handlerSpy).toHaveBeenCalledTimes(0)
      expect(clickCounter).toBe(1)
    })

    it('正确得再次绑定事件', async () => {
      document.dispatchEvent(new Event(eventName))
      expect(clickCounter).toBe(1)
      expect(handlerSpy).toHaveBeenCalledTimes(1)
      await rAF()
      const p = getEle()
      expect(p.getAttribute(attrForTest)).toBe(`再次绑定了${eventName}事件`)
      p.dispatchEvent(new Event(eventName))
      // await rAF() // dispatchEvent是同步的, 所以不需要等待
      expect(clickCounter).toBe(2)
      expect(handlerSpy).toHaveBeenCalledTimes(2)
    })
    /* { timeout: 2000 } */
  })

  return { config, render }
}

test(createJsDomOption, creatorFactory)

// describe.skip('卸载操作-skip', () => {})

// export { test }
