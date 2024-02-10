/**
 * @description ele.key是只读的?
 * @param {Element} ele
 * @param {string} key
 * */
function isReadonlyIDLAttr(ele, key) {
  if (key === 'form' && ele.tagName === 'INPUT') return true
  return false
}

/**
 * @description ele.key=value should work
 * @param {Element} ele
 * @param {string} key
 * */
function shouldSetAsProp(ele, key) {
  if (isReadonlyIDLAttr(ele, key)) return false
  return key in ele
}

/**
 * @param {{window?: import('#shims').RendererConfig['window']}} [arg0]
 */
function createDOMOption({ window } = {}) {
  window = window || globalThis

  const { document } = window

  /**
   * @description 在指定环境运行的渲染器的配置
   * @type {import('#shims').RendererConfig}
   */
  const domOpt = {
    get window() {
      return window
    },

    get document() {
      return document
    },

    createElement: tag => {
      return document.createElement(tag)
    },
    insert: (child, parent, anchor) => {
      parent.insertBefore(child, anchor)
    },
    setElementText: (el, text) => {
      el.textContent = text
    },
    patchProps: (el, key, _, nextValue) => {
      if (shouldSetAsProp(el, key)) {
        const attrType = typeof el[key]
        let attrVal = nextValue/* html */ `<input type='checkbox' name='scales' checked />` // 对于如上的模版内容, 编译得的vnode的props如下:
        /* JSON */ `{type: 'checkbox', name: 'scales', checked: ''}`
        // 当由浏览器来解析时, 文档标签内的一切attr的值都被视为字符串,
        // 因为HTMLInputElement.checked IDL attr是布尔类型,
        // 根据HTML规范, 布尔类型的属性其名称只要被书写在了标签内, 值就会被视为true,
        // 换言之, 空字符值对于布尔类型的attr来说, 也是true,
        // Element.setAttribute方法的行为也是如此,
        // 而如果直接通过el.checked = ''来设置, 则会被视为false
        // 所以这里需要对布尔类型的attr做特殊处理
        if (attrType === 'boolean' && nextValue === '') attrVal = true
        el[key] = attrVal
      } else {
        if (nextValue == null) {
          // if (nextValue == null || nextValue === false) {
          el.removeAttribute(key)
        } else {
          el.setAttribute(key, nextValue)
        }
      }
    },
    addEventListener: (el, event, handler) => {
      el.addEventListener(event.slice(2).toLowerCase(), handler)
    },
    getContainer: (css = '#app') => document.querySelector(css)
  }
  return domOpt
}

export { createDOMOption }
