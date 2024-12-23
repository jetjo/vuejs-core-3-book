import { isArray } from "lodash";
import type { Container } from "./container";
import { _Comment, _Text, _Fragment, type VHTMLElement, type VNode } from "./vnode";

export type Options = {
  createElement: any;
  setElementText: any;
  insert: any;
  patchProps: any;
  createText: any;
  createComment: any;
  setText: any;
  setComment: any;
}

function createRenderer(options: Options) {
  // const { createElement, setElementText, insert, patchProps } = options;

  /**vnode没有对应old VNode，并且vnode.type是字符串，挂载，并设置vnode.el */
  function mountElement(vnode: VHTMLElement, container) {
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

  function patch(n1, n2: VNode, container) {
    // //类型不同，没必要打补丁
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      n1 = null;
    }
    // !至此，新旧vnode类型相同
    const { type } = n2;
    if (typeof type === 'string') {
      if (!n1) {
        mountElement(n2, container);
      } else {
        patchElement(n1, n2); // !不需要container
      }
    } else if (type === _Text) {
      if (!n1) {
        const el = n2.el = createText(n2.children);
        insert(el, container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    } else if (type === _Comment) {
      if (!n1) {
        const el = n2.el = createComment(n2.children);
        insert(el, container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          setComment(el, n2.children)
        }
      }
    } else if (type === _Fragment) {
      if (!n1) {
        n2.children.forEach(child => patch(null, child, container))
      } else {
        patchChildren(n1, n2, container)
      }
    } else if (typeof type === 'object') {
      // 组件
    }
  }

  function patchElement(n1: VHTMLElement, n2: VHTMLElement) {
    const el = n2.el = n1.el; // !设置vnode.el
    const oldProps = n1.props;
    const newProps = n2.props;
    for (const key in newProps) {
      if (newProps[key] === oldProps[key]) continue;
      patchProps(el, key, oldProps[key], newProps[key])
    }
    for (const key in oldProps) {
      if (key in newProps) continue;
      patchProps(el, key, oldProps[key], null)
    }
    patchChildren(n1, n2, el);
  }

  function patchChildren(n1: VNode, n2: VNode, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => typeof c === 'object' && unmount(c))
      }
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // !diff
      } else {
        setElementText(container, '');
        n2.children.forEach(cn => patch(null, cn, container));
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => typeof c === 'object' && unmount(c))
      } else if (typeof n1.children === 'string') {
        setElementText(container, '')
      }
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
    if (vnode.type === _Fragment) {
      vnode.children.forEach(c => unmount(c))
      return
    }
    const parent = vnode.el.parentNode;
    parent?.removeChild(vnode.el);
  }

  return {
    render
  }
}

function createElement(type: string) {
  return document.createElement(type);
}

function setElementText(el: Node, text: string) {
  el.textContent = text;
}

function insert(el: Node, parent: Node, anchor: Node | null = null) {
  parent.insertBefore(el, anchor);
}

function patchProps(el: Element, key: string, oldVal, newVal) {
  if (/^on/.test(key)) {
    const eventName = key.slice(2).toLowerCase();
    // !没有处理同一事件绑定多个handler、
    // !事件发生时间早于绑定事件时间（但冒泡到达时间晚于绑定事件时间）等问题
    oldVal && el.removeEventListener(eventName, oldVal);
    el.addEventListener(eventName, newVal);
  } else if (key === 'class') {
    // !通过className设值，性能比使用setAttribute和classList快一倍
    el.className = newVal || ''
  } else if (shouldSetAsProps(key, el, newVal)) {
    const type = typeof el[key]
    if (type === 'boolean' && newVal === '') {
      newVal = true
    }
    el[key] = newVal
  } else {
    el.setAttribute(key, newVal)
  }
}

function shouldSetAsProps(key: any, el: Element, value: any) { // !value 何用
  if (el.tagName === 'INPUT' && key === 'form') return false; // !只读属性 穷举
  // 兜底
  return key in el;
}

function createText(text: string) {
  return document.createTextNode(text);
}

function setText(el: Text, text: string) {
  el.nodeValue = text;
}


function createComment(comment: string) {
  return document.createComment(comment);
}

function setComment(el: Comment, comment: string) {
  el.nodeValue = comment;
}

const options = { createElement, setElementText, createComment, createText, setText, setComment, insert, patchProps }

createRenderer(options);
