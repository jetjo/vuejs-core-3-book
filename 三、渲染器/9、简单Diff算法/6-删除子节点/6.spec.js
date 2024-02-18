import { describe, it, expect } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from '../../8、挂载与更新/10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../5-新增节点/5.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { Fragment } from '../../convention.js'

const suitName = '删除子节点'

/**@type {typeof baseTest} */
export const test = (optionFactory, factory) => {
  baseTest(optionFactory, factory)

  describe(suitName, async () => {
    it('挂载、更新、卸载', async () => {
      const { render, rAF, container } = await getApi(optionFactory, factory, suitName)

      render(
        {
          type: Fragment,
          // @ts-ignore
          children: [
            // @ts-ignore
            { type: 'p', key: 0, props: { 't-i': 0 }, children: '0' },
            { type: 'p', key: 1, props: { 't-i': 1 }, children: '1' },
            { type: 'p', key: 2, props: { 't-i': 2 }, children: '2' },
            { type: 'p', key: 3, props: { 't-i': 3 }, children: '3' }
          ]
        },
        container
      )
      await rAF()
      expect(container.innerHTML).toBe(
        /* html */ `<p t-i="0">0</p><p t-i="1">1</p><p t-i="2">2</p><p t-i="3">3</p>`
      )
      render(
        {
          type: Fragment,
          children: [
            // @ts-ignore
            { type: 'p', key: 2, props: { 't-i': 2 }, children: '2' },
            // @ts-ignore
            { type: 'p', key: 1, props: { 't-i': 1 }, children: '1' }
          ]
        },
        container
      )
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<p t-i="2">2</p><p t-i="1">1</p>`)
      render(null, container)
      await rAF()
      expect(container.outerHTML).toBe(/* html */ `<div id="app"></div>`)
    })
  })
}

if (await isLatestVer(createJsDomOption, creatorFactory)) {
  test(createJsDomOption, creatorFactory)
}
