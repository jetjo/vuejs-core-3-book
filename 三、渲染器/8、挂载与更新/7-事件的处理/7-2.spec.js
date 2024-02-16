import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import creatorFactory from '../6-区分vnode类型/api.js'
import createJsDomOption from './render-opt-browser.js'
import { test as baseTest, fixRenderForTest } from './7-1.spec.js'
import { queueMacroTask, warn } from '#root/utils'
import { ref, effect } from '#vue-fixed/reactive'
import { getApi, isLatestVer } from '../../utils/test.helper.js'

/**@type {typeof baseTest} */
export const test = (optionFactory, factory) => {
  baseTest(optionFactory, factory)

  const handlerSpy = vi.fn()
  const eventKey = 'onClick'
  const eventName = eventKey.slice(2).toLowerCase()
  const parentNodeType = 'div'
  const nodeType = 'p'
  // NOTE: 不能包含大写字母,会被转换为小写
  const attrForTest = 'test-name' // 'testName'

  const parentHasProps = ref(false)

  // @ts-ignore
  function getVnode() {
    /**@type {*} */
    const vnode = {
      type: parentNodeType,
      props: parentHasProps.value
        ? {
            [eventKey]: (/** @type {Event} */ e) => {
              handlerSpy(e.target !== e.currentTarget)
            },
            [attrForTest]: `绑定了${eventName}事件`
          }
        : {},
      children: [
        {
          type: nodeType,
          props: {
            [eventKey]: () => {
              parentHasProps.value = !parentHasProps.value
            }
          }
        }
      ]
    }
    return vnode
  }

  describe('7-引出要在下一节解决的问题', async () => {
    beforeEach(() => {
      // vi.useFakeTimers({
      //   loopLimit: 100,
      //   // shouldAdvanceTime: true,
      //   // NOTE: 不指定的话, 在调用`window.requestAnimationFrame`时会完全阻塞, 造成超时
      //   toFake: ['setTimeout', 'clearTimeout']
      //   // advanceTime: 1000,
      // })
    })

    afterEach(() => {
      // // 两个方法都能清除一个spy上的调用记录
      // // 但是reset会将mock赋值为vi.fn(() => {})
      // // vi.resetAllMocks();
      // vi.clearAllMocks()
      // vi.useRealTimers()
    })

    const getEle = (css = '', container = document) => {
      const ele = container.querySelector(css)
      if (!ele) throw new Error(`未找到${css}元素`)
      return ele
    }

    it(`正确绑定事件`, async () => {
      // prettier-ignore
      const { render, container, config, rAF } = await getApi(optionFactory, factory, '7-引出要在下一节解决的问题', '正确绑定事件')
      effect(() => {
        // 确保依赖与`parentHasProps`
        // warn('effect before', parentHasProps.value)
        fixRenderForTest(render, config)
        render(getVnode(), container)
        // render(getVnode(), container, parentHasProps.value ? 'effect re-run' : undefined)
        warn('effect after')
      })
      await rAF()
      const p = getEle(nodeType)
      let parent = getEle(parentNodeType, container)
      expect(parent.getAttribute(attrForTest)).toBe(null)
      p.dispatchEvent(new Event(eventName))
      await queueMacroTask()
      await rAF()
      // warn('effect after???')
      // NOTE: holly shit!!!🤬, 不要忘记重新获取一遍!!!
      // 并且,指定`container`, 因为`container`也是div类型
      parent = getEle(parentNodeType, container) 
      expect(document.body.innerHTML).toBe(
        /* html */ `<div id="app"><div test-name="绑定了click事件"><p></p></div></div>`
      )
      expect(parent.getAttribute(attrForTest)).toBe(`绑定了${eventName}事件`)
      expect(handlerSpy).toHaveBeenCalledTimes(0)
      // // 当前被阻塞的计时器的回调会影响下一个测试, 所以在最后要放行, 否则计时器会被清理, 其回调不会执行到
      // vi.runAllTimers();
    })
    /* { timeout: 2000 } */
  })
}

if (await isLatestVer(createJsDomOption, creatorFactory)) {
  test(createJsDomOption, creatorFactory)
}
