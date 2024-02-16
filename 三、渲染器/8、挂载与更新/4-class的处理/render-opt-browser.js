import { warn } from '#root/utils'
import baseCreate from '../3-正确地设置元素属性/render-opt-browser.js'

const VER = '8-4 browser'
/**@type {import('#shims').RendererConfigCreator} */
async function createDOMOption() {
  /**@type {import('#shims').RendererConfig} */
  const domOpt = await baseCreate()

  const basePatch = domOpt.patchProps

  domOpt.patchProps = (el, key, prevValue, nextValue) => {
    // warn('patch', VER, 'patchProps', key)
    if (key === 'class') {
      if (typeof nextValue !== 'string') {
        // 需要提前调用`normalizeClass`方法将非字符串正常化为字符串
        throw new Error('class必须是字符串')
      }
      // NOTE: 为节点设置class,有三种途径:
      // 1. 通过setAttribute方法设置
      // 2. 通过元素对象的className属性设置
      // 3. 通过元素对象的classList属性设置
      // 经过测试, 通过className设置时性能最好, 通过setAttribute设置时性能最差
      el.className = nextValue || ''
      return el
    }
    return basePatch(el, key, prevValue, nextValue)
  }
  domOpt.patchProps.isElement = basePatch.isElement

  return Object.assign(domOpt, { version: VER })
}

createDOMOption.version = VER
export default createDOMOption
