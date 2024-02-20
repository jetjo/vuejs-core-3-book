import { isLatestVer } from '../utils/test.helper.js'
import { getApi } from '../utils/test.helper.js'
import vnodes_ from '../vnodes.json'
// import factory from './3-如何移动元素/api.js'
import factory from './4-改善性能/api.js'

// @ts-ignore
export async function test(optionCreator, title = '11-3 快速Diff算法测试', isBrowser = false) {
  if (await isLatestVer(optionCreator, factory, isBrowser)) {
    const { render, container } = await getApi(
      optionCreator,
      factory,
      title,
      '子节点增删改',
      isBrowser
    )

    /**@type {Array<*>} */
    const vnodes = vnodes_
    let i = 0

    render(vnodes[i++], container)

    document.addEventListener('click', () => {
      if (i >= vnodes.length) i = 0
      render(vnodes[i++], container)
      window.requestAnimationFrame(() => {
        const codeBox = document.querySelector('#vnode>pre')
        if (!codeBox) {
          alert('没有找到codeBox!')
          return
        }
        codeBox.textContent = JSON.stringify(vnodes[i - 1], null, 2)
      })
    })

    // render(null, container)
  }
}
