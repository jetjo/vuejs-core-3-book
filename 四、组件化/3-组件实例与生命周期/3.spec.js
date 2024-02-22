import { describe, it, expect, vi } from 'vitest'
import { option } from '@jetjo/vue3-chapter3'
import { isLatestVer, getApi } from '@jetjo/vue3-chapter3/utils'
import { queueMacroTask } from '@jetjo/vue3/utils'
import factory from './api.js'
import { test as baseTest } from '../2-组件状态与自更新/2.spec.js'
import Com3 from './Com3.js'

const suitName = '组件实例与生命周期'

/**@type {typeof baseTest} */
export const test = (option, factory) => {
  baseTest(option, factory)
  /**@returns {*} */
  function getVNode() {
    return {
      type: Com3
    }
  }
  describe(suitName, () => {
    it('组件状态', async () => {
      const { render, container, rAF } = await getApi(option, factory, suitName)
      const vnode = getVNode()
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe('<div>Com3的文本内容: bar</div>')
      vnode.component.state.foo = 'hello world~'
      await queueMacroTask()
      expect(container.innerHTML).toBe('<div>Com3的文本内容: hello world~</div>')
    })
  })
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
