import { describe, it, expect } from 'vitest'
import factory from './api.js'
import option from '../10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../10-文本节点和注释节点/10.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { Fragment, Text } from '../../convention.js'

const suitName = 'Fragment渲染'

/**@type {typeof baseTest} */
export const test = (option, factory) => {
  baseTest(option, factory)

  describe(suitName, async () => {
    it('挂载、更新、卸载', async () => {
      const { render, rAF, container, apiVer } = await getApi(option, factory, suitName)

      render(
        // @ts-ignore
        { type: Fragment, children: [{ type: 'p' }, { type: Text, children: 'text' }] },
        container
      )
      await rAF()
      expect(container.innerHTML).toBe('<p></p>text')
      if (apiVer.split('-')[0] === '8') {
        // @ts-ignore 截止版本8-11, 还未实现对数组类型的children的更新, 所以这里应该抛出异常
        expect(() => render({ type: Fragment, children: [] }, container)).toThrow()
      }
      // await rAF()
      render(null, container)
      await rAF()
      expect(container.outerHTML).toBe(/* html */ `<div id="app"></div>`)
    })
  })
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
