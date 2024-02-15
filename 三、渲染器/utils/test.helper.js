import { describe } from 'vitest'
import { defArg0, warn } from '#root/utils'

/**@returns {string|undefined} */
function getTestVerTag() {
  if (typeof process === 'object' && typeof process.env == 'object') {
    if (process.env.VITEST_FLAG) return process.env.VITEST_FLAG + ' from process'
  }
  if (typeof import.meta.env === 'object') {
    return import.meta.env.VITEST_FLAG + ' from import'
  }
}

// @ts-ignore
function isLatestVer(optFactory, factory) {
  const testFlag = getTestVerTag()
  if (!optFactory.version || !factory.version) throw new Error('版本号不能为空')
  const curFlag = `${optFactory.version},${factory.version}`
  // warn(`testFlag: ${testFlag}, curFlag: ${curFlag}`)
  const flag = testFlag?.startsWith(curFlag)
  if (!flag) {
    describe.skip('有新版本api, 此版本无需测试了...')
  }
  return flag
}

// @ts-ignore
const getApi = async (createOption, creatorFactory, suitName, testName) => {
  const config = await createOption()
  const { requestAnimationFrame: rAF, version: optVer } = config
  const { render, version: apiVer } = creatorFactory(defArg0)(config)
  const container = config.getContainer()
  warn(`${apiVer} - ${optVer} - ${suitName} - ${testName}`)
  return { render, rAF, config, apiVer, optVer, container }
}

export { isLatestVer, getApi }
