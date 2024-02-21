import factory from './api.js'
import option from '../../8、挂载与更新/10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../../10、双端Diff算法/5-删除元素/5.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'

const suitName = '快速Diff-处理前置和后置元素以及仅需新增或删除的特殊情形'

/**@type {typeof baseTest} */
export const test = (option, factory) => {
  baseTest(option, factory)
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
