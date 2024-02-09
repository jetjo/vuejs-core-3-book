import { reactive } from '#vue/c'

function useElement(css) {
  function getEle(css, doWithEle) {
    const eleLen = document.querySelectorAll(css).length
    if (eleLen !== 1) {
      console.error(`There are ${eleLen} elements with css ${css}`)
      return
    }
    const ele = document.querySelector(css)
    if (doWithEle) doWithEle(ele)
    return ele
  }

  const map = reactive(new Map())

  const withoutRef = v => {
    try {
      return v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v
    } catch (e) {
      console.error(e)
      return e.message
    }
  }

  function getInitVal(css, prop, key, isAttr = false) {
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
