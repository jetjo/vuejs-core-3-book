import { describe, it, expect } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from '../4-class的处理/render-opt-browser.js'
import { test as baseTest } from '../3-正确地设置元素属性/3.spec.js'
import { getApi, isLatestVer } from '../../utils/test.helper.js'

/**@type {typeof baseTest} */
export const test = (createOption, creatorFactory) => {
  baseTest(createOption, creatorFactory)

  describe('5-卸载操作', async () => {
    it(`正确卸载`, async () => {
      // prettier-ignore
      const { render, rAF, container } = await getApi(createOption, creatorFactory, '卸载操作', '正确卸载')
      render({ type: 'div' }, container)
      await rAF()
      render(null, container)
      await rAF()
      expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
    })
  })
}

if (isLatestVer(createJsDomOption, creatorFactory)) {
  test(createJsDomOption, creatorFactory)
}
