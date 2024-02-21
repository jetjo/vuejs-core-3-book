import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { Fragment, Text } from '../../convention.js'
// import factory from './api.js'
import factory from '../../11、快速Diff算法/4-改善性能/api.js'

// @ts-ignore
export async function test(option, title = '4-子节点次序更新', isBrowser = false) {
  if (await isLatestVer(option, factory, isBrowser)) {
    const { render, container } = await getApi(
      option,
      factory,
      title,
      '只有两个子节点的特殊情形',
      isBrowser
    )

    render(
      {
        // @ts-ignore
        type: Fragment,
        children: [
          // @ts-ignore
          { type: 'p', key: 0 },
          // @ts-ignore
          { type: Text, key: 1, children: 'text' }
        ]
      },
      container
    )

    document.addEventListener('click', () => {
      render(
        {
          // @ts-ignore
          type: Fragment,
          children: [
            // @ts-ignore
            { type: Text, key: 1, children: 'hello' },
            // @ts-ignore
            { type: 'p', key: 0 }
          ]
        },
        container
      )
    })

    // render(null, container)
  }
}
