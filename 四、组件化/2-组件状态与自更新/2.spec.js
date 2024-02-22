import { describe, it, expect, vi } from 'vitest'
import factory from './api.js'
import { option } from '@jetjo/vue3-chapter3'
import { isLatestVer, getApi } from '@jetjo/vue3-chapter3/utils'
import { test } from '../1-渲染组件/1.spec.js'
import Com2 from './Com2.js'

const suitName = '组件状态'

/**@type {typeof test} */
export const test2 = (option, factory) => {
  test(option, factory)
  /**@returns {*} */
  function getVNode() {
    return {
      type: Com2
    }
  }
  describe(suitName, () => {
    it('组件状态', async () => {
      const { render, container, rAF } = await getApi(option, factory, suitName)
      const vnode = getVNode()
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe('<div>Com2的文本内容: bar</div>')
    })
  })
}

if (await isLatestVer(option, factory)) {
  test2(option, factory)
}
