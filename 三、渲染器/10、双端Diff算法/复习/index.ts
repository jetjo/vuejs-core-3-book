import type { Options } from "../../8、挂载与更新/复习";
import { _Comment, _Fragment, _Text } from "../../8、挂载与更新/复习/vnode";
import type { Container } from "../../9、简单Diff算法/复习/container";
import type { VNode, VHTMLElement, VComment, VFragment, VText } from "../../9、简单Diff算法/复习/vnode";

function createRenderer(options: Options) {

    function isVHTMLElement(vnode: VNode | null): vnode is VHTMLElement {
        return !!(vnode && typeof vnode.type === 'string')
    }


    function isVText(vnode: VNode | null): vnode is VText {
        return !!(vnode && vnode.type === _Text)
    }


    function isVComment(vnode: VNode | null): vnode is VComment {
        return !!(vnode && vnode.type === _Comment)
    }


    function isVFragment(vnode: VNode | null): vnode is VFragment {
        return !!(vnode && vnode.type === _Fragment)
    }

    function mountElement(vnode: VHTMLElement, container, anchor?) {
        const el = vnode.el = createElement(vnode.type)
        if (vnode.props) {
            for (const key in vnode.props) {
                patchProps(el, key, null, vnode.props[key])
            }
        }
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        } else if (Array.isArray(vnode.children)) {
            vnode.children.forEach(c => patch(null, c, el))
        }
        insert(el, container, anchor)
    }

    function patchElement(n1: VHTMLElement, n2: VHTMLElement) {
        const el = n2.el = n1.el;
        for (const key in n2.props) {
            if (n1.props[key] === n2.props[key]) continue;
            patchProps(el, key, n1.props[key], n2.props[key])
        }
        for (const key in n1.props) {
            if (key in n2.props) continue;
            patchProps(el, key, n1.props[key], null)
        }
        patchChildren(n1, n2, el)
    }

    function patchKeyedChildren(n1: VNode, n2: VNode, container) {
        if (!Array.isArray(n1.children) || !Array.isArray(n2.children)) return;
        const newChildren = n2.children, oldChildren = n1.children as (VNode | undefined)[];
        let newStartIdx = 0, oldStartIdx = 0;
        let newEndIdx = newChildren.length - 1, oldEndIdx = oldChildren.length - 1;
        let newStart = newChildren[newStartIdx], newEnd = newChildren[newEndIdx];
        let oldStart = oldChildren[oldStartIdx], oldEnd = oldChildren[oldEndIdx];
        while (newStartIdx >= newEndIdx && oldStartIdx >= oldEndIdx) {
            if (!oldStart) {
                // !在之前新旧节点首尾各不相同的情形下被处理过了
                oldStart = oldChildren[++oldStartIdx]
            } else if (!oldEnd) {
                oldEnd = oldChildren[--oldEndIdx] // !同上
            } else if (newStart.key === oldStart.key) {
                patch(oldStart, newStart, container)
                newStart = newChildren[++newStartIdx]
                oldStart = oldChildren[++oldStartIdx]
            } else if (newEnd.key === oldEnd.key) {
                patch(oldEnd, newEnd, container)
                newEnd = newChildren[--newEndIdx]
                oldEnd = oldChildren[--oldEndIdx]
            } else if (newEnd.key === oldStart.key) {
                patch(oldStart, newEnd, container)
                insert(oldStart.el, container, oldEnd.el.nextSibling)
                newEnd = newChildren[--newEndIdx]
                oldStart = oldChildren[++oldStartIdx]
            } else if (newStart.key === oldEnd.key) {
                patch(oldEnd, newStart, container)
                insert(oldEnd.el, container, oldStart.el)
                newStart = newChildren[++newStartIdx]
                oldEnd = oldChildren[--oldEndIdx]
            } else {
                // !新旧节点的首尾各不相同，
                const oldIdx = oldChildren.findIndex(c => c && c.key === newStart.key)
                if (oldIdx !== -1) {
                    const old = oldChildren[oldIdx]
                    patch(old!, newStart, container)
                    insert(old!.el, container, oldStart.el)
                    oldChildren[oldIdx] = undefined
                } else {
                    patch(null, newStart, container, oldStart.el)
                }
                newStart = newChildren[++newStartIdx]
            }
        }
        if (oldEndIdx > oldStartIdx && newEndIdx <= newStartIdx) {
            // !剩下需要新增的新节点
            const anchor = newChildren[newEndIdx + 1]?.el;
            for (let i = newStartIdx; i <= newEndIdx; i++) {
                patch(null, newChildren[i], container, anchor)
            }
        } else if (newEndIdx > newStartIdx && oldEndIdx <= oldStartIdx) {
            // !剩下需要移除的旧节点
            for (let j = oldStartIdx; j <= oldEndIdx; j++) {
                unmount(oldChildren[j]!)
            }
        } else {
            // !不会执行到此，这种情况下，上面的while循环不会退出
        }
    }
    function patchChildren(n1: VHTMLElement | VFragment, n2: VHTMLElement | VFragment, container) {
        if (typeof n2.children === 'string') {
            if (Array.isArray(n2.children)) {
                n2.children.forEach(c => unmount(c))
            }
            setElementText(container, n2.children)
        } else if (Array.isArray(n2.children)) {
            if (!Array.isArray(n1.children)) {
                setElementText(container, "")
                n2.children.forEach(c => patch(null, c, container))
            } else {
                patchKeyedChildren(n1, n2, container)
            }
        } else {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => unmount(c))
            } else if (typeof n1.children === 'string') {
                setElementText(container, "")
            }
        }
    }
    function patch(n1: VNode | null, n2: VNode, container: any, anchor?: any) {
        if (n1 && n1.type !== n2.type) {
            unmount(n1)
            n1 = null
        }
        // !至此，新旧vnode类型相同
        const { type } = n2;
        if (typeof type === 'string') {
            if (!isVHTMLElement(n1)) {
                mountElement(n2, container, anchor)
            } else {
                patchElement(n1, n2)
            }
        } else if (type === _Text) {
            if (!isVText(n1)) {
                const el = n2.el = createText(n2.children)
                insert(el, container, anchor)
            } else {
                const el = n2.el = n1.el
                if (n2.children !== n1.children) {
                    setText(el, n2.children)
                }
            }
        } else if (type === _Comment) {
            if (!isVComment(n1)) {
                const el = n2.el = createComment(n2.children)
                insert(el, container, anchor)
            } else {
                const el = n2.el = n1.el
                if (n2.children !== n1.children) {
                    setText(el, n2.children)
                }
            }
        } else if (type === _Fragment) {
            if (!isVFragment(n1)) {
                n2.children.forEach(c => patch(null, c, container, anchor))
            } else {
                patchChildren(n1, n2, container)
            }
        } else if (typeof type === 'object') {

        }
    }
    function unmount(vnode: VNode) {
        if (vnode.type === _Fragment) {
            vnode.children.forEach(c => unmount(c))
            return
        }
        vnode.el?.parentNode?.removeChild?.(vnode.el)
    }
    function render(vnode: VNode, container: Container) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                unmount(container._vnode)
            }
        }
        container._vnode = vnode
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
