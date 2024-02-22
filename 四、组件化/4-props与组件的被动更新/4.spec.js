import { describe, it, expect, vi } from 'vitest'
import { option } from '@jetjo/vue3-chapter3'
import { isLatestVer, getApi } from '@jetjo/vue3-chapter3/utils'
import { queueMacroTask } from '@jetjo/vue3/utils'
import factory from './api.js'
import { test as baseTest } from '../3-组件实例与生命周期/3.spec.js'
import Com4 from './Com4.js'

const suitName = 'props与组件的被动更新'

/**@type {typeof baseTest} */
export const test = (option, factory) => {
  baseTest(option, factory)
  /**@returns {*} */
  function getVNode() {
    return {
      type: Com4
    }
  }
  describe(suitName, () => {
    it('组件状态', async () => {
      const { render, container, rAF } = await getApi(option, factory, suitName)
      const vnode = getVNode()
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe(
        /* html */ `<div><div>ChildCom4的文本内容: bar</div></div>`
      )
      vnode.component.state.foo = 'hello world~'
      await queueMacroTask()
      expect(container.innerHTML).toBe(
        /* html */ `<div><div>ChildCom4的文本内容: hello world~</div></div>`
      )
    })
  })
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
