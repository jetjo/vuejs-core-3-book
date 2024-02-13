import { describe } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from './render-opt-browser.js'

import { test } from '../1-挂载子节点与元素属性/api.spec.js'

// describe('3-正确地设置元素属性', () => {
// })
test(createJsDomOption, creatorFactory, '3-正确地设置元素属性-inherit')

describe.skip('3-正确地设置元素属性-skip', () => {})

export { test }
