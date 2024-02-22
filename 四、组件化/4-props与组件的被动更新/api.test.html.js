import { isLatestVer, getApi } from '@jetjo/vue3-chapter3/utils'
import Com4 from './Com4.js'
import factory from './api.js'

// @ts-ignore
export async function test(option, title = '4-4-0 props与组件被动更新', isBrowser = false) {
  if (await isLatestVer(option, factory, isBrowser)) {
    const { render, container } = await getApi(option, factory, title, '子节点增删改', isBrowser)
    function getVNode() {
      return {
        type: Com4
      }
    }

    const vnode = getVNode()

    // @ts-ignore
    render(vnode, container)

    document.addEventListener('click', () => {
      // @ts-ignore
      vnode.component.state.foo = 'hello world~'
    })

    // render(null, container)
  }
}
