import { defArg0, warn, isTest, error } from '#root/utils'

/**@returns {string|undefined} */
function getTestVerTag() {
  if (typeof process === 'object' && typeof process.env == 'object') {
    if (process.env.VITEST_FLAG) return process.env.VITE_ST_FLAG + ' from process'
  }
  if (typeof import.meta.env === 'object') {
    return import.meta.env.VITE_ST_FLAG + ' from import'
  }
}

// @ts-ignore
async function isLatestVer(option, factory, isBrowser = false) {
  const testFlag = getTestVerTag()
  if (!option.version || !factory.version) throw new Error('版本号不能为空')
  const curFlag = `${option.version},${factory.version}`
  warn(`testFlag: ${testFlag}, curFlag: ${curFlag}`) //, import.meta.env)
  const flag = testFlag?.startsWith(curFlag)
  if (isTest && !flag) {
    const { describe } = await import('vitest')
    describe.skip('有新版本api, 此版本无需测试了...')
  }
  if (!isTest && !flag && !isBrowser) error('有新版本api, 此版本无跳过了...')
  return flag || isBrowser
}

// @ts-ignore
/**
 * @param {*} option
 * @param {*} creatorFactory
 * @param {string} suitName
 * @param {string} testName
 * @returns {Promise<{render: import('#shims').Renderer['render'], rAF: import('#shims').RendererConfig['requestAnimationFrame'], config: import('#shims').RendererConfig, apiVer: string, optVer:string, container: Element, renderer: any }>}
 * */
const getApi = async (option, creatorFactory, suitName, testName = '', remainPage = false) => {
  if (!remainPage) option.clearPage()
  const { requestAnimationFrame: rAF, version: optVer } = option
  await rAF()
  const renderer = creatorFactory(defArg0)(option)
  const { render, version: apiVer } = renderer
  const container = option.getContainer()
  if (!container) throw new Error('container is not defined')
  warn(`${apiVer} - ${optVer} - ${suitName} - ${testName}`)
  return { render, rAF, config: option, apiVer, optVer, container, renderer }
}

export { isLatestVer, getApi }
