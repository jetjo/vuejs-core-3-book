import factory from './api.js'
import option from '../../8、挂载与更新/10-文本节点和注释节点/render-opt-browser.js'
import { test as baseTest } from '../../9、简单Diff算法/6-删除子节点/6.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'

const suitName = '双端Diff排序-新增元素'

/**@type {typeof baseTest} */
export const test = (option, factory) => {
  baseTest(option, factory)
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
