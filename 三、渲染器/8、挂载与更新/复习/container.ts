import type { VNode } from "./vnode";

export interface WebContainer extends Element {

}

export interface Container extends WebContainer {
    _vnode: VNode
}
