import { ref, effect } from '#vue-fixed/reactive'
import creatorFactory from '../6-区分vnode类型/api.js'
// import optionCreator from '../7-事件的处理/render-opt-browser.js'
// import optionCreator from './render-opt-browser.js'
import { getApi, isLatestVer, fixRenderForTest3_8_7 } from '../../utils/test.helper.js'
import { warn } from '#root/utils'

// @ts-ignore
export async function test(optionCreator, title = '8-事件冒泡与更新时机问题', isBrowser = false) {
  if (await isLatestVer(optionCreator, creatorFactory, isBrowser)) {
    const parentHasProps = ref(false)
    // @ts-ignore
    function getVnode() {
      const eventKey = 'onClick'
      const eventName = eventKey.slice(2).toLowerCase()
      const parentNodeType = 'div'
      const nodeType = 'p'
      // NOTE: 不能包含大写字母,会被转换为小写
      // const attrForTest = 'test-name' // 'testName'
      /**@type {*} */
      const vnode = {
        type: parentNodeType,
        props: parentHasProps.value
          ? {
              [eventKey]: (/** @type {Event} */ e) => {
                alert(`绑定了${eventName}事件`)
              }
            }
          : {},
        children: [
          {
            type: 'span',
            children: parentHasProps.value ? 'click me' : ''
          },
          {
            type: nodeType,
            props: {
              [eventKey]: () => {
                parentHasProps.value = !parentHasProps.value
              }
            },
            children: 'click me'
          }
        ]
      }

      warn({ vnode })
      return vnode
    }

    const { render, container, config } = await getApi(
      optionCreator,
      creatorFactory,
      title,
      `没有调用事件发生后才绑定的'handler'`
    )
    fixRenderForTest3_8_7(render, config) //, `8-事件冒泡与更新时机问题-html`)
    effect(() => {
      render(getVnode(), container) //, `8-事件冒泡与更新时机问题-html`)
      // render(getVnode(), container, parentHasProps.value ? 'effect re-run' : undefined)
    })
  }
}
