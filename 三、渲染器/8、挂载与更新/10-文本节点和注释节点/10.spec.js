import { describe, it, expect, vi } from 'vitest'
import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { test as baseTest } from '../9-更新子节点/9.spec.js'
import optionCreator from './render-opt-browser.js'
import factory from './api.js'
import { Text, Comment } from '../../convention.js'

const suitName = '文本节点与注释节点'
/**@type {typeof baseTest} */
export const test = (optionCreator, factory) => {
  baseTest(optionCreator, factory)

  describe(suitName, async () => {
    it('文本节点', async () => {
      const { render, config, rAF, container } = await getApi(optionCreator, factory, suitName)
      // @ts-ignore
      render({ type: Text, children: '文本节点' }, container)
      await rAF()
      expect(container.innerHTML).toBe('文本节点')
    })

    it('注释节点', async () => {
      const { render, config, rAF, container } = await getApi(optionCreator, factory, suitName)
      // @ts-ignore
      render({ type: Comment, children: '注释节点' }, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<!--注释节点-->`)
    })

    it('文本子节点', async () => {
      const { render, config, rAF, container } = await getApi(optionCreator, factory, suitName)
      // @ts-ignore
      render({ type: 'div', children: [{ type: Text, children: '文本子节点' }] }, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div>文本子节点</div>`)
      // @ts-ignore
      render({ type: 'div', children: '新的文本' }, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div>新的文本</div>`)
      // @ts-ignore
      render({ type: 'div', children: [{ type: Text, children: '新的文本子节点' }] }, container)
      await rAF()
      expect(container.innerHTML).toBe(/* html */ `<div>新的文本子节点</div>`)
    })
  })
}

if (await isLatestVer(optionCreator, factory)) {
  test(optionCreator, factory)
}
