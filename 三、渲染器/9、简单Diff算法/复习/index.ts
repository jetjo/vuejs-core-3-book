import type { Options } from "../../8、挂载与更新/复习";
import type { Container } from "./container";
import { _Comment, _Fragment, _Text, type VComment, type VFragment, type VHTMLElement, type VNode, type VText } from "./vnode";

function createRenderer(option: Options) {
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

    function unmount(vnode: VNode) {
        if (vnode.type === _Fragment) {
            vnode.children.forEach(c => unmount(c))
            return
        }
        (vnode.el as Node).parentNode?.removeChild(vnode.el)
    }

    function mountElement(vnode: VHTMLElement, container: any, anchor?: any) {
        const el = vnode.el = createElement(vnode.type);
        if (vnode.props) {
            for (const key in vnode.props) {
                patchProps(el, key, null, vnode.props[key])
            }
        }
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        } else if (Array.isArray(vnode.children)) {
            vnode.children.forEach(child => patch(null, child, vnode))
        }
        insert(el, container)
    }

    function patchElement(n1: VHTMLElement, n2: VHTMLElement) {
        const el = n2.el = n1.el
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

    function patchChildren(n1: VNode, n2: VNode, container: any) {
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
                let lastMaxIndex = 0;
                for (let i = 0; i < n2.children.length; i++) {
                    const newChild = n2.children[i];
                    let j = 0;
                    for (j; j < n1.children.length; j++) {
                        const oldChild = n1.children[j];
                        if (newChild.key !== oldChild.key) continue;
                        patch(oldChild, newChild, container)
                        if (j >= lastMaxIndex) {
                            lastMaxIndex = j
                        } else {
                            // !insert方法将el插入到anchor之前，所以需要获取nextSibling
                            const anchor = n2.children[i - 1].el.nextSibling
                            insert(newChild.el, container, anchor)
                        }
                        break;
                    }
                    if (j === n1.children.length) {
                        // 新的子节点
                        // !也需要渲染到正确的位置
                        let anchor = n2.children[i - 1]?.el?.nextSibling
                        if (!anchor && i === 0) {
                            // !确保新的后续节点一定在这个新节点的后面
                            anchor = container.firstChild
                        }
                        patch(null, newChild, container, anchor)
                    }
                }
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
                    setComment(el, n2.children)
                }
            }
        } else if (type === _Fragment) {
            if (!isVFragment(n1)) {
                n2.children.forEach(c => patch(null, c, container, anchor))
            } else {
                patchChildren(n1, n2, container)
            }
        } else if (typeof type === 'object') {

        } else {

        }
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
