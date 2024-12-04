
import type { Container } from "./container";
import type { VNode } from "./vnode";

function createRenderer(options) {
  const { createElement, setElementText, insert } = options;

  function mountElement(vnode: VNode, container) {
    const element = createElement(vnode.type); // 只传递type即可
    // 不要忘记填充元素内容
    if (typeof vnode.children === 'string') {
      setElementText(element, vnode.children); // 文本节点
    }
    insert(element, container);
  }
  /** 不处理卸载，因此vnodeNew不能为空 */
  function patch(vnodeOld, vnodeNew, container) {
    if (!vnodeOld) {
      mountElement(vnodeNew, container); // 挂载
    } else {
      // 打补丁
    }
  }
  /**
   * @description 第一个参数也是vnode
   */
  function render(vnode, container: Container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      // 如果没有旧节点，不必要
      if (container._vnode) {
        container.innerHTML = ''
      }
    }
    container._vnode = vnode;
  }
  return {
    render
  }
}

// web平台render
const { render } = createRenderer({
  /**@param tag 对应vnode.type，但是不要以type作为参数名 */
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  /**
   * @param parent 父容器，不要以container命名
   * @param [anchor=null] 不要忘记锚点
   */
  insert(el, parent: Element, anchor = null) {
    // 不是调用appendChild
    parent.insertBefore(el, anchor)
  }
})
