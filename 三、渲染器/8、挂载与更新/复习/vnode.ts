
export interface VHTMLElement {
    el: any,
    type: string,
    /**支持挂载非文本子节点，扩充类型VNode[] */
    children: null | string | VNode[],
    props: {
        [key: string]: string | number | boolean,
        id: string
    }
}

export const _Text = 111, _Comment = 222, _Fragment = 333;

export interface VText {
    el: any,
    type: typeof _Text,
    children: string
}

export interface VComment {
    el: any,
    type: typeof _Comment,
    children: string
}

export interface VFragment {
    el: any,
    type: typeof _Fragment,
    children: VNode[],
    props: {
        [key: string]: string | number | boolean,
        id: string
    }
}

export type VNode = VHTMLElement | VText | VComment | VFragment
