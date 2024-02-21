import baseConfig from '../3-正确地设置元素属性/render-opt-browser.js'

/**@type {typeof baseConfig.patchProps} */
const patchProps = function (el, key, prevValue, nextValue) {
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
  return baseConfig.patchProps(el, key, prevValue, nextValue)
}

patchProps.isElement = baseConfig.patchProps.isElement

/**@type {typeof baseConfig} */
const update = {
  ...baseConfig,
  version: '8-4 browser',
  patchProps
}

export default update
