import factory from '../6-区分vnode类型/api.js'
import option from './render-opt-browser.js'
import { test as baseTest } from '../7-事件的处理/7-2.spec.js'
import { isLatestVer } from '../../utils/test.helper.js'

/**@type {typeof baseTest} */
export const test = (option, factory) => {
  baseTest(option, factory)
}

if (await isLatestVer(option, factory)) {
  test(option, factory)
}
