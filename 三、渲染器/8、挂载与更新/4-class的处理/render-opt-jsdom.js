// import { JSDOM } from 'jsdom'
import baseCreate from '../3-正确地设置元素属性/render-opt-jsdom.js'

/**@type {import('#shims').RendererConfigCreator} */
function createJsDomOption() {
  const base = baseCreate()

  const basePatch = base.patchProps

  base.patchProps = (el, key, prevValue, nextValue) => {
    if (key === 'class') {
      if (typeof nextValue !== 'string') {
        throw new Error('class必须是字符串')
      }
      el.className = nextValue || ''
      return
    }
    basePatch(el, key, prevValue, nextValue)
  }

  return base
}

export default createJsDomOption
