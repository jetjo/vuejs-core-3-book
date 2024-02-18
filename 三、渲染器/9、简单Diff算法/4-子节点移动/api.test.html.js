import { isLatestVer } from '../../utils/test.helper.js'
import { getApi } from '../../utils/test.helper.js'
import { Fragment, Text } from '../../convention.js'
import factory from './api.js'

// @ts-ignore
export async function test(optionCreator, title = '4-子节点次序更新', isBrowser = false) {
  if (await isLatestVer(optionCreator, factory, isBrowser)) {
    const { render, container } = await getApi(
      optionCreator,
      factory,
      title,
      '只有两个子节点的特殊情形'
    )

    render(
      {
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
