import { describe, it, expect } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from '../4-class的处理/render-opt-jsdom.js'
import { test as baseTest } from '../3-正确地设置元素属性/api.spec.js'
import { defArg0 } from '#root/utils'

/**@type {typeof baseTest} */
export const test = (createOption, creatorFactory, suitName = '5-卸载操作') => {
  const { config: _config, render: _render } = baseTest(
    createOption,
    creatorFactory,
    `${suitName} - inherit`
  )
  const config = _config || createOption()
  if (!config) throw new Error('config is not defined')
  if (!config.getContainer)
    throw new Error('config.getContainer is not defined')
  const container = config.getContainer()
  const { requestAnimationFrame: rAF } = config

  const render = _render || (creatorFactory(defArg0)(config) || {})['render']
  if (!render) throw new Error('render is not defined')

  describe(suitName, () => {
    it('正确卸载', async () => {
      render(null, container)

      await rAF()

      expect(document.body.innerHTML).toBe(/* html */ `<div id="app"></div>`)
    })
  })

  return { config, render }
}

test(createJsDomOption, creatorFactory)

describe.skip('卸载操作-skip', () => {})
