import { isArray } from "lodash";
import type { Container } from "./container";
import type { VNode } from "./vnode";

export type Options = {
  createElement: any;
  setElementText: any;
  insert: any;
  patchProps: any;

}

function createRenderer(options: Options) {
  const { createElement, setElementText, insert, patchProps } = options;

  /**挂载,并设置vnode.el */
  function mountElement(vnode: VNode, container) {
    const element = vnode.el = createElement(vnode.type);
    if (typeof vnode.children === 'string') {
      setElementText(element, vnode.children);
    } else if (isArray(vnode.children)) {
      vnode.children.map(vnode => patch(null, vnode, element))
    }
    if (vnode.props) {
      // for (const [key, val] of Object.entries(vnode.props)) {
      //   element.setAttribute(key, val) // 作为HTML Attribute
      //   // 或者作为DOM Properties
      //   element[key] = val
      // }
      for (const key in vnode.props) {
        patchProps(element, key, null, vnode.props[key])
      }
    }
    insert(element, container);
  }

  function patch(vnodeOld, vnodeNew, container) {
    if (!vnodeOld) {
      mountElement(vnodeNew, container);
    } else {
    }
  }

  /**渲染,并设置container._vnode */
  function render(vnode, container: Container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 不能处理生命周期钩子、自定义指令等
        // container.innerHTML = ''
        unmount(container._vnode)
      }
    }
    container._vnode = vnode;
  }

  function unmount(vnode: VNode) {
    const parent = vnode.el.parentNode;
    parent?.removeChild(vnode.el);
  }

  return {
    render
  }
}

function patchProps(el: Element, key, oldVal, newVal) {
  if (shouldSetAsProps(key, el)) {
    if (key === 'class') {
      // !通过className设值，性能比使用setAttribute和classList快一倍
      el.className = newVal || ''
    }
    const type = typeof el[key]
    if (type === 'boolean' && newVal === '') {
      newVal = true
    }
    el[key] = newVal
  } else {
    el.setAttribute(key, newVal)
  }
}

function shouldSetAsProps(key: any, el: Element) {
  // !只读属性 穷举
  if (el.tagName === 'INPUT' && key === 'form') return false;
  // 兜底
  return key in el;
}
