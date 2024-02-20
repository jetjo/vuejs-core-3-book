import creatorFactory from './api.js'
import createJsDomOption from '../../8、挂载与更新/10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../../10、双端Diff算法/5-删除元素/5.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'

const suitName = '快速Diff-改善性能'

/**@type {typeof baseTest} */
export const test = (optionFactory, factory) => {
  baseTest(optionFactory, factory)
}

if (await isLatestVer(createJsDomOption, creatorFactory)) {
  test(createJsDomOption, creatorFactory)
}
