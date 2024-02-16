import { defArg0, warn, isTest, error } from '#root/utils'
import { requireCallable } from '#utils'

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
async function isLatestVer(optFactory, factory, isBrowser = false) {
  const testFlag = getTestVerTag()
  if (!optFactory.version || !factory.version) throw new Error('版本号不能为空')
  const curFlag = `${optFactory.version},${factory.version}`
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
 * @param {*} createOption
 * @param {*} creatorFactory
 * @param {string} suitName
 * @param {string} testName
 * @returns {Promise<{render: import('#shims').Renderer['render'], rAF: import('#shims').RendererConfig['requestAnimationFrame'], config: import('#shims').RendererConfig, apiVer: string, optVer:string, container: Element }>}
 * */
const getApi = async (createOption, creatorFactory, suitName, testName) => {
  const config = await createOption()
  const { requestAnimationFrame: rAF, version: optVer } = config
  const { render, version: apiVer } = creatorFactory(defArg0)(config)
  const container = config.getContainer()
  if(!container) throw new Error('container is not defined')
  warn(`${apiVer} - ${optVer} - ${suitName} - ${testName}`)
  return { render, rAF, config, apiVer, optVer, container }
}

/**
 * @param {((vnode: VVNode<Node, Element, {[key: string]: any;}> | null, container: Element | null | undefined) => void) & {config?: import("#shims").RendererCreatorFactoryConfig<Node, Element, {[key: string]: any;}> | undefined;}} render
 * @param {import("#shims").RendererConfig<EventTarget, Node, Element, ParentNode, HTMLElement, Document, typeof globalThis | Window | import("#shims").JSDOMWindow>} config
 */
function fixRenderForTest3_8_7(render, config) {
  if (arguments[2]) {
    warn({ render, config }, arguments[2])
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
        config.patchProps(el, key, oldProps[key], newProps[key], arguments[2])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        config.patchProps(el, key, oldProps[key], null)
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
    const isVNodeArrayChildrenC = render.config?.isVNodeArrayChildrenC
    const isVNodeChildAtomC_VVNode = render.config?.isVNodeChildAtomC_VVNode
    requireCallable(isVNodeArrayChildrenC)
    requireCallable(isVNodeChildAtomC_VVNode)
    if (!isVNodeArrayChildrenC(oldChildren) || !isVNodeArrayChildrenC(newChildren)) {
      warn('此函数只用来更新文本子节点的内容')
      return
    }
    let i = 0
    for (const vChild of newChildren) {
      if (!vChild || !isVNodeChildAtomC_VVNode(vChild)) throw new Error('不支持的节点类型')
      if (!oldChildren[i]) throw new Error('暂不支持新增子节点')
      /**@type {*} */
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
      config.setElementText(el, vChild.children)
      i++
    }
  }

  const patch = render.config?.patch
  if (!render.config || !patch) throw new Error('patch is not defined')

  render.config.patch = function (n1, n2, container) {
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

export { isLatestVer, getApi, fixRenderForTest3_8_7 }
