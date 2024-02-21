import factory from '../1-挂载子节点与元素属性/api.js'
import option from './render-opt-browser.js'

import { test } from '../1-挂载子节点与元素属性/1.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'

if (await isLatestVer(option, factory)) {
  test(option, factory)
}

export { test }
