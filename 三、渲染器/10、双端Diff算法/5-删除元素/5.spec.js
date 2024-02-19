import { describe, it, expect } from 'vitest'
import creatorFactory from './api.js'
import createJsDomOption from '../../8、挂载与更新/10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../../9、简单Diff算法/6-删除子节点/6.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { Fragment } from '../../convention.js'

const suitName = '双端Diff排序-删除元素'

/**@type {typeof baseTest} */
export const test = (optionFactory, factory) => {
  baseTest(optionFactory, factory)
}

if (await isLatestVer(createJsDomOption, creatorFactory)) {
  // @ts-ignore
  test(createJsDomOption, creatorFactory)
}
