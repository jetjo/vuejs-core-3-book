import { describe, it, expect, vi } from 'vitest'
import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { test as baseTest } from '../9-更新子节点/9.spec.js'
import optionCreator from './render-opt-browser.js'
import factory from './api.js'

/**@type {typeof baseTest} */
const test = (optionCreator, factory) => {
  baseTest(optionCreator, factory)
}

if (await isLatestVer(optionCreator, factory)) {
  test(optionCreator, factory)
}
