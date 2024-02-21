import type { VNode, VNodeArrayChildren } from 'vue'

export type VNodeChildAtomC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VVNode<HN, HE, EP> | string | number | boolean | null | undefined | void

export type VNodeChildAtomKeyed<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VVNode<HN, HE, EP> & { key: unknown }

export type VNodeOptProps<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Omit<VVNode<HN, HE, EP>, 'type' | 'props' | 'children' | 'el'>

export type VVNodeOptionalSFC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Partial<VNodeOptProps<HN, HE, EP>> &
  Pick<VVNode<HN, HE, EP>, 'type' | 'props' | 'children' | 'el'>

export type VNodeChildAtomC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  | (Omit<VVNodeOptionalSFC<HN, HE, EP>, 'children'> & {
      children?: VNodeNormalizedChildrenC1<HN, HE, EP>
    })
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VNodeArrayChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC<HN, HE, EP> | VNodeChildAtomC<HN, HE, EP>>

export type VNodeArrayChildrenKeyed<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeChildAtomKeyed<HN, HE, EP>>

export type VNodeArrayChildrenKeyedC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeChildAtomKeyed<HN, HE, EP> | undefined>

export type VNodeNormalizedChildrenKeyed<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VNodeArrayChildrenKeyed<HN, HE, EP>

export type VNodeNormalizedChildrenKeyedC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = VNodeArrayChildrenKeyedC<HN, HE, EP>

export type VNodeArrayChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = Array<VNodeArrayChildrenC1<HN, HE, EP> | VNodeChildAtomC1<HN, HE, EP>>

export type VNodeChildC<HN = RendererNode, HE = RendererElement, EP = { [key: string]: any }> =
  | VNodeChildAtomC<HN, HE, EP>
  | VNodeArrayChildrenC<HN, HE, EP>

export type ChildC = Exclude<VNode['children'], VNodeArrayChildren>

export type VNodeNormalizedChildrenC<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> =
  /* | Exclude<VVNode['children'], VNodeArrayChildren> 
  VVNode['children']的类型就是VNodeNormalizedChildrenC,
  这样就形成循环依赖了!*/
  ChildC | VNodeArrayChildrenC<HN, HE, EP>

export type VNodeNormalizedChildrenC1<
  HN = RendererNode,
  HE = RendererElement,
  EP = { [key: string]: any }
> = ChildC | VNodeArrayChildrenC1<HN, HE, EP>
