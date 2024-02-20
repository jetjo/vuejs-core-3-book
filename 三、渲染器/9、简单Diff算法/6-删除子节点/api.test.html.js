import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import vnodes_ from '../../vnodes.json'
// import factory from './api.js'
import factory from '../../11、快速Diff算法/4-改善性能/api.js'

// @ts-ignore
export async function test(optionCreator, title = '5,6-子节点增删', isBrowser = false) {
  if (await isLatestVer(optionCreator, factory, isBrowser)) {
    const { render, container } = await getApi(optionCreator, factory, title, '子节点增删')

    /**@type {Array<*>} */
    const vnodes = vnodes_
    let i = 0

    render(vnodes[i++], container)

    document.addEventListener('click', () => {
      if (i >= vnodes.length) i = 0
      render(vnodes[i++], container)
    })

    // render(null, container)
  }
}
