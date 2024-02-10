import { reactive } from '#vue/c'

/**@param {string} css css选择器 */
function useElement(css) {
  /**
   * @param {string} css
   * @param {(...args:any[])=>any} doWithEle
   * @returns {Element|null}
   */
  function getEle(css, doWithEle) {
    const eleLen = document.querySelectorAll(css).length
    if (eleLen !== 1) {
      console.error(`There are ${eleLen} elements with css ${css}`)
      return null
    }
    const ele = document.querySelector(css)
    if (doWithEle) doWithEle(ele)
    return ele
  }

  const map = reactive(new Map())

  /**
   * @description 切断引用关系
   * @param {any} v
   * @returns 如果是值类型直接返回, 否则返回深度拷贝后的值
   */
  const withoutRef = v => {
    try {
      return v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v
    } catch (e) {
      console.error(e)
      // @ts-ignore
      return e?.message
    }
  }

  /**
   * @description 在`window.requestAnimationFrame`回调中, 再次获取属性值并存储在map中.
   * @param {string} css css选择器
   * @param {string} prop HTML Attribute或DOM Property
   * @param {string} [key] 属性名
   * @param {boolean} [isAttr] 是HTML Attribute还是DOM Property
   * @returns 返回属性值
   */
  function getInitVal(css, prop, key = undefined, isAttr = false) {
    key = key || `${css}\`s initial ${prop}`
    const initVal = map.get(key)
    if (initVal !== undefined) return initVal
    window.requestAnimationFrame(() => {
      getEle(css, ele => {
        console.dir(ele)
        const val = isAttr ? ele.getAttribute(prop) : ele[prop]
        console.log(val, `isAttr: ${isAttr}`)
        map.set(key, withoutRef(val))
      })
    })
  }

  const eventMap = new WeakSet()
  /**
   * @description 在`event`事件触发时, 获取`css`元素的`prop`属性值,并将其存储在map中
   * @param {string} css css选择器
   * @param {string} prop
   * @param {string} event
   * @returns 返回属性值
   */
  function getVal(css, prop, event) {
    const key = `${css}\`s ${prop} on ${event}`
    window.requestAnimationFrame(() => {
      getEle(css, ele => {
        if (eventMap.has(ele)) return
        if (map.has(key))
          console.warn(`The css ${css} has a new instance node!`)
        const handler = () => {
          map.set(key, withoutRef(ele[prop]))
        }
        ele.addEventListener(event, handler)
        eventMap.add(ele)
      })
    })
    return getInitVal(css, prop, key)
  }

  /**
   * @param {string} css
   * @param {string} attr
   */
  function getAttrVal(css, attr) {
    const key = `${css}\`s attr ${attr}`
    return getInitVal(css, attr, key, true)
  }

  return typeof css === 'string'
    ? {
        getInitVal: getInitVal.bind(null, css),
        getVal: getVal.bind(null, css),
        getAttrVal: getAttrVal.bind(null, css)
      }
    : { getInitVal, getVal, getAttrVal }
}

export default useElement
