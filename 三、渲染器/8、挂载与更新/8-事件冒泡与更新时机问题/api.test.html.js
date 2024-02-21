import { ref, effect } from '#vue-fixed/reactive'
import creatorFactory from '../6-区分vnode类型/api.js'
// import optionCreator from '../7-事件的处理/render-opt-browser.js'
// import optionCreator from './render-opt-browser.js'
import { getApi, isLatestVer } from '../../utils/test.helper.js'
import { warn } from '#root/utils'
import { requireCallable } from '#utils'

// @ts-ignore
function fixRenderForTest(option, config) {
  if (arguments[2]) {
    warn({ config, option }, arguments[2])
  }

  // @ts-ignore
  function patchElement(n1, n2) {
    const el = (n2.el = n1.el)
    const oldProps = n1.props
    const newProps = n2.props
    // if (arguments[2])  warn('patchElement~~~~', '7-1.spec.js', { oldProps, newProps }, arguments[2])
    if (arguments[2]) warn('patchElement~~~~', '7-1.spec.js', { n1, n2 }, arguments[2])
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        if (arguments[2]) warn('patchElement~~~~', '7-1.spec.js', key, arguments[2])
        // @ts-ignore
        option.patchProps(el, key, oldProps[key], newProps[key], arguments[2])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        option.patchProps(el, key, oldProps[key], null)
      }
    }
  }

  /**
   * @param {VVNode} n1
   * @param {VVNode} n2
   */
  function patchChildren(n1, n2) {
    const oldChildren = n1.children
    const newChildren = n2.children
    const isVNodeArrayChildrenC = config?.isVNodeArrayChildrenC
    const isVNodeChildAtomC_VVNode = config?.isVNodeChildAtomC_VVNode
    requireCallable(isVNodeArrayChildrenC)
    requireCallable(isVNodeChildAtomC_VVNode)
    if (!isVNodeArrayChildrenC(oldChildren) || !isVNodeArrayChildrenC(newChildren)) {
      warn('此函数只用来更新文本子节点的内容')
      return
    }
    let i = 0
    // @ts-ignore
    for (const vChild of newChildren) {
      if (!vChild || !isVNodeChildAtomC_VVNode(vChild)) throw new Error('不支持的节点类型')
      // @ts-ignore
      if (!oldChildren[i]) throw new Error('暂不支持新增子节点')
      /**@type {*} */
      // @ts-ignore
      const oldChild = oldChildren[i]
      if (vChild.type !== oldChild.type) throw new Error('暂不支持变更子节点类型')
      if (typeof vChild.children !== 'string' || typeof oldChild.children !== 'string') {
        warn('此函数只用来更新文本子节点的内容')
        continue
      }
      if (!oldChild.el || !document.body.contains(oldChild.el))
        throw new Error('旧的子节点没有挂载到页面上')
      if (vChild.el && vChild.el !== oldChild.el) throw new Error('暂不支持变更子节点顺序')
      /**@type {Element} */
      const el = (vChild.el = oldChild.el)
      option.setElementText(el, vChild.children)
      i++
    }
  }

  const patch = config?.patch
  if (!config || !patch) throw new Error('patch is not defined')

  // @ts-ignore
  config.patch = function (n1, n2, container) {
    if (arguments[3]) {
      warn('patch~~~~~~', '7-1.spec.js', 'patch', arguments[3], { n1, n2 })
    }
    if (n1 && n2 && n1.type === n2.type && typeof n2.type === 'string') {
      // @ts-ignore
      patchElement(n1, n2, arguments[3])
      // warn('patchElement', '7-1.spec.js', 'patch')
      // @ts-ignore
      patchChildren(n1, n2, arguments[3])
      return
    }
    patch(n1, n2, container)
    // warn('mountElement', '7-1.spec.js', 'patch')
  }
}

// @ts-ignore
export async function test(option, title = '8-事件冒泡与更新时机问题', isBrowser = false) {
  if (await isLatestVer(option, creatorFactory, isBrowser)) {
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

    const { render, container, config, renderer } = await getApi(
      option,
      creatorFactory,
      title,
      `没有调用事件发生后才绑定的'handler'`,
      isBrowser
    )
    fixRenderForTest(config, renderer) //, `8-事件冒泡与更新时机问题-html`)
    effect(() => {
      render(getVnode(), container) //, `8-事件冒泡与更新时机问题-html`)
      // render(getVnode(), container, parentHasProps.value ? 'effect re-run' : undefined)
    })
  }
}
