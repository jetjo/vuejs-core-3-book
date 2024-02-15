/**
 * @param {((vnode: VVNode<Node, Element, {[key: string]: any;}> | null, container: Element | null | undefined) => void) & {config?: import("#shims").RendererCreatorFactoryConfig<Node, Element, {[key: string]: any;}> | undefined;}} render
 * @param {import("#shims").RendererConfig<EventTarget, Node, Element, ParentNode, HTMLElement, Document, typeof globalThis | Window | import("#shims").JSDOMWindow>} config
 */
export function fixRenderForTest(render, config) {
  // @ts-ignore
  function patchElement(n1, n2) {
    const el = (n2.el = n1.el)
    const oldProps = n1.props
    const newProps = n2.props
    warn('patchElement~~~~', '7-1.spec.js', { oldProps, newProps }, arguments[2])
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        if (arguments[2]) warn('patchElement~~~~', '7-1.spec.js', key, arguments[2])
        // @ts-ignore
        config.patchProps(el, key, oldProps[key], newProps[key], arguments[2])
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

  render.config.patch = function (n1, n2, container) {
    if (arguments[3]) {
      warn('patch~~~~~~', '7-1.spec.js', 'patch', arguments[3], { n1, n2 })
    }
    if (n1 && n2 && n1.type === n2.type && typeof n2.type === 'string') {
      // @ts-ignore
      patchElement(n1, n2, arguments[3])
      warn('patchElement', '7-1.spec.js', 'patch')
      return
    }
    patch(n1, n2, container)
    warn('mountElement', '7-1.spec.js', 'patch')
  }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import creatorFactory from '../6-区分vnode类型/api.js'
import createJsDomOption from './render-opt-browser.js'
import { test as baseTest } from '../5-卸载操作/5.spec.js'
import { log, warn } from '#root/utils'
import { getApi, isLatestVer } from '../../utils/test.helper.js'

const suitName = '7-事件处理'
/**@type {typeof baseTest} */
export const test = (optionFactory, factory) => {
  baseTest(optionFactory, factory)

  let clickCounter = 0

  const handlerSpy = vi.fn()
  const eventKey = 'onClick'
  const eventName = eventKey.slice(2).toLowerCase()
  const nodeType = 'p'
  // NOTE: 不能包含大写字母,会被转换为小写
  const attrForTest = 'test-name' // 'testName'

  describe(suitName, async () => {
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
      if (!ele) throw new Error(`element ${nodeType} not found, ${document.body.innerHTML}`)
      return ele
    }

    /**
     * @param {*} render
     * @param {*} container
     * @param {*} config
     * @param {*} testId
     */
    function test(render, container, config, testId) {
      fixRenderForTest(render, config)
      if (!container) throw new Error('container not found')
      // window.requestAnimationFrame(() => {
      render(vnodeRemove, container)
      warn('remove')
      const h = (/** @type {Event} */ e) => {
        // @ts-ignore
        // NOTE: 之所以判断自定义的`testId`属性,是因为`document`分发的`click`事件的`handler`会被调用两次
        // prettier-ignore
        if (e.target !== e.currentTarget || e.target !== document || document.testId !== testId) return
        // @ts-ignore
        document.testId = ''
        // e.stopPropagation()
        handlerSpy()
        vnode.props[attrForTest] = `再次绑定了${eventName}事件`
        render(vnode, container)
        warn('update')
        document.removeEventListener('click', h)
      }
      document.addEventListener('click', h)
      // })
    }

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
          (/**@type {*} */ e) => {
            setTimeout(() => {
              e.target.test() // alert('clicked 2')
              handlerSpy()
            }, 1000)
          }
        ],
        [attrForTest]: `绑定了${eventName}事件`
      },
      children: 'text'
    }

    it(`正确绑定事件`, async () => {
      // prettier-ignore
      const { render, rAF, container } = await getApi(createJsDomOption, creatorFactory, suitName, '正确绑定事件')
      render(vnode, container)
      await rAF()
      const p = getEle()
      expect(p.getAttribute(attrForTest)).toBe(`绑定了${eventName}事件`)
      p.dispatchEvent(new Event(eventName))
      expect(clickCounter).toBe(1)
      expect(handlerSpy).toHaveBeenCalledTimes(1)
      p.test = () => void 0
      // 当前被阻塞的计时器的回调会影响下一个测试, 所以在最后要放行, 否则计时器会被清理, 其回调不会执行到
      vi.runAllTimers()
    })

    it(`正确卸载事件`, async () => {
      // prettier-ignore
      const { render, rAF, container, config } = await getApi(createJsDomOption, creatorFactory, suitName, '正确卸载事件')
      render(vnode, container)
      await rAF()
      let p = getEle()
      p.dispatchEvent(new Event(eventName))
      p.test = () => test(render, container, config, '正确卸载事件')
      vi.runAllTimers()
      await rAF() // 等待页面更新, 此更新是前面的click事件触发的
      expect(handlerSpy).toHaveBeenCalledTimes(2)
      p = getEle()
      expect(p.getAttribute(attrForTest)).toBe(`移除了${eventName}事件`)
      // 当前章节的版本,未实现对`vnode.child`的更新, 所以`p.textContent`还是`clicked 1`
      // expect(p.textContent).toBe(`clicked ${clickCounter}`)
      p.dispatchEvent(new Event(eventName))
      expect(handlerSpy).toHaveBeenCalledTimes(2)
      expect(clickCounter).toBe(2)
    })

    it(`正确得再次绑定事件`, async () => {
      expect(handlerSpy).toHaveBeenCalledTimes(0)
      // prettier-ignore
      const { render, rAF, container, config } = await getApi(createJsDomOption, creatorFactory, suitName, '正确得再次绑定事件')
      render(vnode, container)
      await rAF()
      let p = getEle()
      p.dispatchEvent(new Event(eventName))
      expect(handlerSpy).toHaveBeenCalledTimes(1)
      p.test = () => test(render, container, config, '正确得再次绑定事件')
      vi.runAllTimers()
      expect(handlerSpy).toHaveBeenCalledTimes(2)
      await rAF() // 等待页面更新, 此更新是前面的click事件触发的
      p = getEle()
      p.dispatchEvent(new Event(eventName))
      // warn(`~~~~body: ${document.body.innerHTML}`)
      // @ts-ignore
      document.testId = '正确得再次绑定事件'
      document.dispatchEvent(new Event(eventName))
      // warn(`~~~~body: ${document.body.innerHTML}`)
      expect(handlerSpy).toHaveBeenCalledTimes(3)
      await rAF()
      p = getEle()
      expect(p.getAttribute(attrForTest)).toBe(`再次绑定了${eventName}事件`)
      p.dispatchEvent(new Event(eventName))
      // await rAF() // dispatchEvent是同步的, 所以不需要等待
      expect(clickCounter).toBe(4)
      expect(handlerSpy).toHaveBeenCalledTimes(4)
      p.test = () => void 0
      vi.runAllTimers()
    })
    /* { timeout: 2000 } */
  })
}

if (isLatestVer({ version: 'skip ' }, { version: 'skip ' })) {
  test(createJsDomOption, creatorFactory)
}
