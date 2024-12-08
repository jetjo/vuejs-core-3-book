
export interface HTMLElementVNode {
    el: any,
    type: string,
    /**支持挂载非文本子节点，扩充类型VNode[] */
    children: null | string | VNode[],
    props: {
        [key: string]: string | number | boolean,
        id: string
    }
}

export interface TextVNode {
    el: any,
    type: 111,
    children: string
}

export interface CommentVNode {
    el: any,
    type: 222,
    children: string
}

export type VNode = HTMLElementVNode | TextVNode | CommentVNode
