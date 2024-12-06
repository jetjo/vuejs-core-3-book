
export interface VNode {
    el: any,
    type: string,
    /**支持挂载非文本子节点，扩充类型VNode[] */
    children: string | VNode[],
    props: {
        [key: string]: string | number | boolean,
        id: string
    }
}
