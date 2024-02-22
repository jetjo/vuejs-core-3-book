import { describe, it, expect, vi } from 'vitest'
import factory from './api.js'
import { option } from '@jetjo/vue3-chapter3'
import { isLatestVer, getApi } from '@jetjo/vue3-chapter3/utils'
import Com1 from './Com1.js'

const suitName = '渲染组件'

/**
 * @template ET
 * @template {ET} HN
 * @template {HN} Ele
 * @template {HN} ParentN
 * @template {Ele} EleNS
 * @template {HN} Doc
 * @param {import('#shims').RendererConfig} option
 * @param {typeof factory} factory
 * @returns {void}
 */
export const test = (option, factory) => {
  /**@returns {*} */
  function getVNode() {
    return {
      type: Com1
    }
  }
  describe(suitName, () => {
    it('渲染组件', async () => {
      const { render, container, rAF } = await getApi(option, factory, suitName)
      const vnode = getVNode()
      render(vnode, container)
      await rAF()
      expect(container.innerHTML).toBe('<div>Com1的文本内容</div>')
    })
  })
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
