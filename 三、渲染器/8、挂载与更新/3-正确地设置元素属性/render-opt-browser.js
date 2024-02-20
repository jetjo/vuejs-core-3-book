import { voidFunc, warn } from '#root/utils'
import baseCreate from '../1-挂载子节点与元素属性/render-opt-jsdom.js'

const VER = '8-3 browser'

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

/**@type {import('#shims').RendererConfigCreator} */
async function createDOMOption() {
  // window = window || globalThis

  const domOpt = await baseCreate()

  /**@type {Partial<typeof domOpt>} */
  const update = {
    patchProps: (el, key, _, nextValue) => {
      // warn('patch', VER, 'patchProps', key, nextValue)
      // console.warn('patchProps', key, nextValue);
      // 暂未考虑事件
      if (key.startsWith('on')) throw new Error('暂未考虑事件')
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
        // warn('patch-setAttribute', VER, 'setAttribute', key, nextValue)
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute#name
        // NOTE: 此方法会自动将`key`转换为小写字母
        el.setAttribute(key, String(nextValue))
      }
      return el
    }
  }

  // @ts-ignore
  update.patchProps.isElement = function (n) {
    // 断言要求使用显式类型注释声明调用目标中的每个名称。ts(2775)
    // update.patchProps?.requireElement = n => {
    const testFlag = arguments[1]
    if (n instanceof Element) {
      testFlag && warn('n is instance of Element', testFlag)
      const deps = ['setAttribute', 'removeAttribute', 'tagName', 'className']
      for (const key of deps) {
        if (!(key in n)) {
          testFlag && warn(`${key} not in n`, testFlag)
          return false
          // throw new Error(`Element缺少${key}属性`)
        }
      }
      return true
    }
    testFlag && warn('n is not instance of Element', testFlag)
    return false
    // throw new Error('不是Element')
  }

  return Object.assign(domOpt, update, { version: VER })
}

export { shouldSetAsProp }

createDOMOption.version = VER
createDOMOption.defVNode = baseCreate.defVNode

export default createDOMOption
