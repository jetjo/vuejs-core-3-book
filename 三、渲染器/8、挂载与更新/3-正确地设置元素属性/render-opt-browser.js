import { defArg0, voidFunc } from '#root/utils'
import baseCreate from '../1-挂载子节点与元素属性/render-opt-jsdom.js'

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

/**@type {typeof baseCreate} */
function createDOMOption() {
  // window = window || globalThis

  const domOpt = baseCreate()

  /**@type {Partial<typeof domOpt>} */
  const update = {
    patchProps: (el, key, _, nextValue) => {
      console.warn('patchProps', key, nextValue);
      // 暂未考虑事件
      if(key.startsWith('on')) throw new Error('暂未考虑事件')
      if (shouldSetAsProp(el, key)) {
        const attrType = typeof el[key]
        // prettier-ignore
        let attrVal = nextValue
        voidFunc/* html */ `<input type='checkbox' name='scales' checked />` 
        // 对于如上的模版内容, 编译得的vnode的props如下:
        voidFunc/* JSON */ `{type: 'checkbox', name: 'scales', checked: ''}`
        // 当由浏览器来解析时, 文档标签内的一切attr的值都被视为字符串,
        // 因为HTMLInputElement.checked IDL attr是布尔类型,
        // 根据HTML规范, 布尔类型的属性其名称只要被书写在了标签内, 值就会被视为true,
        // 换言之, 空字符值对于布尔类型的attr来说, 也是true,
        // Element.setAttribute方法的行为也是如此,
        // 而如果直接通过el.checked = ''来设置, 则会被视为false
        // 所以这里需要对布尔类型的attr做特殊处理
        if (attrType === 'boolean' && nextValue === '') attrVal = true
        el[key] = attrVal
        return el
      }
      if (nextValue == null) {
        // if (nextValue == null || nextValue === false) {
        el.removeAttribute(key)
      } else {
        el.setAttribute(key, nextValue)
      }
      return el
    }
  }

  return Object.assign(domOpt, update)
}

export { shouldSetAsProp }

export default createDOMOption
