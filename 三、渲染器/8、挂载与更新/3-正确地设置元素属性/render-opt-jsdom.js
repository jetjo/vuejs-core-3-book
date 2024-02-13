// import { JSDOM } from 'jsdom'
import baseCreate from '../1-挂载子节点与元素属性/render-opt-jsdom.js'

import { shouldSetAsProp } from './render-opt-browser.js'

/**@type {import('#shims').RendererConfigCreator} */
function createJsDomOption() {
  const base = baseCreate()

  /**@type {Partial<typeof base>} */
  const update = {
    patchProps: (el, key, _, nextValue) => {
      if (shouldSetAsProp(el, key)) {
        const attrType = typeof el[key]
        let attrVal = nextValue
        if (attrType === 'boolean' && nextValue === '') attrVal = true
        el[key] = attrVal
      } else {
        if (nextValue == null) {
          el.removeAttribute(key)
        } else {
          el.setAttribute(key, nextValue)
        }
      }
    }
  }

  return Object.assign(base, update)
}

export default createJsDomOption
