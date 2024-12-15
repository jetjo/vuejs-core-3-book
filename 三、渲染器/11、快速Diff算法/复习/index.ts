import type { Options } from "../../8、挂载与更新/复习";
import { _Comment, _Fragment, _Text } from "./vnode";
import type { Container } from "./container";
import type { VNode, VHTMLElement, VComment, VFragment, VText } from "./vnode";

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
            vnode.children.forEach(c => patch(null, c, el))// !anchor是c的父节点el的兄弟节点，所以这里是null
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

    function getSequence(arr) {
        const p = arr.slice()
        const result = [0]
        let i, j, u, v, c
        const len = arr.length
        for (i = 0; i < len; i++) {
            const arrI = arr[i]
            if (arrI !== 0) {
                j = result[result.length - 1]
                if (arr[j] < arrI) {
                    p[i] = j
                    result.push(i)
                    continue
                }
                u = 0
                v = result.length - 1
                while (u < v) {
                    c = ((u + v) / 2) | 0
                    if (arr[result[c]] < arrI) {
                        u = c + 1
                    } else {
                        v = c
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1]
                    }
                    result[u] = i
                }
            }
        }
        u = result.length
        v = result[u - 1]
        while (u-- > 0) {
            result[u] = v
            v = p[v]
        }
        return result
    }

    function patchKeyedChildren(n1: VNode, n2: VNode, container) {
        if (!Array.isArray(n1.children) || !Array.isArray(n2.children)) return;
        const newChildren = n2.children as (VNode | undefined)[], oldChildren = n1.children as (VNode | undefined)[];
        // !处理同key的前置节点
        const endJ = Math.min(newChildren.length - 1, oldChildren.length - 1)
        let j = 0;
        let newNode = newChildren[j], oldNode = oldChildren[j]
        while (j <= endJ && newNode!.key === oldNode!.key) {
            patch(oldNode!, newNode!, container)
            j++;
            newNode = newChildren[j], oldNode = oldChildren[j];
        }
        // !上面while每次循环后，j已经指向下一个待处理的元素或者下标超出
        const newEndK = j - newChildren.length, oldEndK = j - oldChildren.length;
        let atK = -1;
        // !处理相同后置节点的前提是endK不等于0（newEndK与oldEndK的最大值是0，j作为下标，j最大值是数组长度）
        // if (j < newChildren.length && j < oldChildren.length) { // !不必，endK等于0时，后续ifelse可正确执行
        const endK = Math.max(newEndK, oldEndK);
        newNode = newChildren.at(atK), oldNode = oldChildren.at(atK);
        while (atK >= endK && newNode!.key === oldNode!.key) {
            patch(oldNode!, newNode!, container)
            atK--;
            newNode = newChildren.at(atK), oldNode = oldChildren.at(atK);
        }
        // }
        if (atK < (oldEndK) && atK >= (newEndK)) {
            // !仅剩新增节点
            const getAnchor = (atNewK) => {
                const atK = atNewK + 2;
                if (atK < 0) return newChildren.at(atK)!.el;
                else return null;
            }
            while (atK >= newEndK) {
                patch(null, newChildren.at(atK--)!, container, getAnchor(atK))
            }
        } else if (atK < (newEndK) && atK >= (oldEndK)) {
            // !仅剩删除节点
            while (atK >= oldEndK) {
                unmount(oldChildren.at(atK--)!)
            }
        } else if (atK >= (oldEndK) && atK >= (newEndK)) {
            const sourceLen = atK - newEndK + 1; // !两个逆向下标
            const source = new Array(sourceLen).fill(-1);
            // !四个正向下标
            const newStartIdx = newChildren.length + newEndK; // j;
            const oldStartIdx = oldChildren.length + oldEndK; // j;
            const newEndIdx = newChildren.length + atK;
            const oldEndIdx = oldChildren.length + atK;
            // !构建索引表
            const keyedIndex = Object.create(null);
            for (let i = newStartIdx; i <= newEndIdx; i++) {
                keyedIndex[newChildren[i]?.key] = i;
            }
            let maxK = 0;
            let needMove = false;
            let patched = 0;
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                const oldChild = oldChildren[i];
                if (patched < sourceLen) {
                    const k = keyedIndex[oldChild?.key]
                    if (typeof k !== 'undefined') {
                        const newChild = newChildren[k];
                        patch(oldChild!, newChild!, container, null);
                        patched++;
                        // !前置元素已经处理过
                        source[k - newStartIdx] = i;
                        if (k >= maxK) {
                            maxK = k;
                        } else {
                            needMove = true;
                        }
                    } else {
                        unmount(oldChild!)
                    }
                } else {
                    unmount(oldChild!)
                }
            }
            if (needMove) {
                const seq = getSequence(source);
                let seqIdx = seq.length - 1;
                let i = sourceLen - 1;
                for (i; i >= 0; i--) {
                    if (source[i] === -1) {
                        const nextIdx = i + newStartIdx + 1;
                        const anchor = nextIdx < newChildren.length ? newChildren[nextIdx]?.el : null;
                        patch(null, newChildren[i + newStartIdx]!, container, anchor)
                    } else if (i !== seq[seqIdx]) {
                        const nextIdx = i + newStartIdx + 1;
                        const anchor = nextIdx < newChildren.length ? newChildren[nextIdx]?.el : null;
                        insert(newChildren[i + newStartIdx]?.el, container, anchor)
                    } else {
                        seqIdx--;
                    }
                }
            }
        }
    }


    function patchKeyedChildren1(n1: VNode, n2: VNode, container) {
        const newChildren = n2.children as VNode[], oldChildren = n1.children as VNode[];
        const newLen = newChildren?.length, oldLen = oldChildren?.length;
        let j = 0;
        const jEnd = Math.min(newLen! - 1, oldLen! - 1);
        let newChild = newChildren[j], oldChild = oldChildren[j];
        while (j <= jEnd && newChild.key === oldChild.key) {
            patch(oldChild, newChild, container);
            j++;
            newChild = newChildren[j];
            oldChild = oldChildren[j];
        }
        let newEndIdx = newLen - 1, oldEndIdx = oldLen - 1;
        newChild = newChildren[newEndIdx], oldChild = oldChildren[oldEndIdx];
        while (newEndIdx >= j && oldEndIdx >= j && newChild.key === oldChild.key) {
            patch(oldChild, newChild, container);
            newEndIdx--;
            oldEndIdx--;
            newChild = newChildren[newEndIdx], oldChild = oldChildren[oldEndIdx];
        }
        if (newEndIdx >= j && oldEndIdx < j) {
            const anchor = newEndIdx + 1 < newChildren.length ? newChildren[newEndIdx + 1].el : null
            while (newEndIdx >= j) {
                patch(null, newChildren[j++], container, anchor)
            }
        } else if (oldEndIdx >= j && newEndIdx < j) {
            while (oldEndIdx >= j) {
                unmount(oldChildren[j++])
            }
        } else if (newEndIdx >= j && oldEndIdx >= j) {
            const startIdx = j;
            const _newEndIdx = newEndIdx;
            const _oldEndIdx = oldEndIdx;
            const sourceLen = _newEndIdx - startIdx + 1;
            const source = new Array[sourceLen].fill(-1)

            const keyIndexMap = Object.create(null);
            for (let i = startIdx; i <= _newEndIdx; i++) {
                keyIndexMap[newChildren[i].key] = i;
            }
            let kMax = 0, move = false, patched = 0;
            for (let i = startIdx; i <= _oldEndIdx; i++) {
                const oldChild = oldChildren[i];
                if (patched < sourceLen) {
                    const k = keyIndexMap[oldChild.key]
                    if (typeof k !== 'undefined') {
                        patch(oldChild, newChildren[k], container, null);
                        patched++;
                        source[k - startIdx] = i;
                        if (k >= kMax) {
                            kMax = k;
                        } else {
                            move = true;
                        }
                    } else {
                        unmount(oldChild);
                    }
                } else {
                    unmount(oldChild);
                }
            }
            if (move) {
                const seq = getSequence(source);
                let sIdx = seq.length - 1;
                for (let i = sourceLen - 1; i >= 0; i--) {
                    if (source[i] === -1) {
                        const anchor = i + startIdx + 1 < newChildren.length ? newChildren[i + startIdx + 1].el : null;
                        patch(null, newChildren[i + startIdx], container, anchor);
                    } else if (i !== seq[sIdx]) {
                        const anchor = i + startIdx + 1 < newChildren.length ? newChildren[i + startIdx + 1].el : null;
                        insert(newChildren[i + startIdx].el, container, anchor);
                    } else {
                        sIdx--;
                    }
                }
            }
        }
    }

    function patchChildren(n1: VHTMLElement | VFragment, n2: VHTMLElement | VFragment, container) {
        if (typeof n2.children === 'string') {
            if (Array.isArray(n2.children)) {
                n2.children.forEach(c => unmount(c))
            }
            // !第一个参数不是n2.el，n2是Fragment时，没有n2.el
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
                n2.children.forEach(c => patch(null, c, container, null))// !anchor是c的父节点el的兄弟节点，所以这里是null
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
