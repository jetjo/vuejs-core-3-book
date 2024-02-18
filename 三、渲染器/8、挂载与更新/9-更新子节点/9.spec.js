import { describe, it, expect, vi } from 'vitest'
import { getApi, isLatestVer } from '../../utils/test.helper'
import renderOptionCtor from '../8-事件冒泡与更新时机问题/render-opt-browser.js'
import { test as baseTest } from '../8-事件冒泡与更新时机问题/8.spec.js'
import factory from './api.js'

const suitName = '更新子节点'

/**@type {typeof baseTest} */
export const test = (renderOptionCtor, factory) => {
  baseTest(renderOptionCtor, factory)

  describe(suitName, async () => {
    it(`暂不支持新旧节点都是数组的情况`, async () => {
      /**@type {*} */
      // @ts-ignore
      const vnode = {
        type: 'div',
        children: [{ type: 'p', children: 'p', props: null, el: null }]
      }
      // prettier-ignore
      const { render, rAF, container, apiVer } = await getApi(renderOptionCtor, factory, suitName, '暂不支持新旧节点都是数组的情况')
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div><p>p</p></div>`)
      const newVnode = { ...vnode }
      newVnode.children = [{ type: 'span', children: 'span', props: null, el: null }]
      // render(newVnode, container)
      if (apiVer.split('-')[0] === '8') {
        expect(() => render(newVnode, container)).toThrow()
      }
    })
    it(`新节点是数组,旧节点是文本`, async () => {
      /**@type {*} */
      // @ts-ignore
      const vnode = {
        type: 'div',
        children: 'holly shit🤬'
      }
      // prettier-ignore
      const { render, rAF, container } = await getApi(renderOptionCtor, factory, suitName, '暂不支持新旧节点都是数组的情况')
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div>holly shit🤬</div>`)
      // NOTE: 这里必须初始化新的变量, 不能直接更改`vnode.children`并将其作为新节点,这是同一个引用!!!
      const newVnode = { ...vnode }
      newVnode.children = [{ type: 'span', children: 'span', props: null, el: null }]
      render(newVnode, container, suitName)
      // expect(() => render(newVnode, container)).toThrow()
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div><span>span</span></div>`)
    })
    it(`新节点是文本,旧节点是数组`, async () => {
      /**@type {*} */
      // @ts-ignore
      const vnode = {
        type: 'div',
        children: [{ type: 'p', children: 'p', props: null, el: null }]
      }
      // prettier-ignore
      const { render, rAF, container } = await getApi(renderOptionCtor, factory, suitName, '暂不支持新旧节点都是数组的情况')
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div><p>p</p></div>`)
      // NOTE: 这里必须初始化新的变量, 不能直接更改`vnode.children`并将其作为新节点,这是同一个引用!!!
      const newVnode = { ...vnode }
      newVnode.children = 'fucking liuyifei'
      render(newVnode, container, suitName)
      // expect(() => render(newVnode, container)).toThrow()
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div>fucking liuyifei</div>`)
    })
  })
}

if (await isLatestVer(renderOptionCtor, factory)) {
  test(renderOptionCtor, factory)
}
