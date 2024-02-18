import { describe, it, expect } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from '../../8、挂载与更新/10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../4-子节点移动/4.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { Fragment, Text } from '../../convention.js'

const suitName = '新增子节点'

/**@type {typeof baseTest} */
export const test = (optionFactory, factory) => {
  baseTest(optionFactory, factory)

  describe(suitName, async () => {
    it('挂载、更新、卸载', async () => {
      const { render, rAF, container } = await getApi(optionFactory, factory, suitName)

      render(
        {
          type: Fragment,
          children: [
            // @ts-ignore
            { type: 'p', key: 0 }
          ]
        },
        container
      )
      await rAF()
      expect(container.innerHTML).toBe('<p></p>')
      render(
        {
          type: Fragment,
          children: [
            // @ts-ignore
            { type: Text, key: 1, children: 'hello' },
            // @ts-ignore
            { type: 'p', key: 0 }
          ]
        },
        container
      )
      await rAF()
      expect(container.innerHTML).toBe('hello<p></p>')
      render(null, container)
      await rAF()
      expect(container.outerHTML).toBe(/* html */ `<div id="app"></div>`)
    })
  })
}

if (await isLatestVer(createJsDomOption, creatorFactory)) {
  test(createJsDomOption, creatorFactory)
}
